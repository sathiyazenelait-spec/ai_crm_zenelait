package com.zenelait.crm.rag;

import com.zenelait.crm.model.TenantKnowledgeChunk;
import com.zenelait.crm.repository.TenantKnowledgeChunkRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/rag")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class VectorRagController {

    private final VectorRagService ragService;
    private final TenantKnowledgeChunkRepository chunkRepository;

    public VectorRagController(VectorRagService ragService, TenantKnowledgeChunkRepository chunkRepository) {
        this.ragService = ragService;
        this.chunkRepository = chunkRepository;
    }

    @PostMapping("/query")
    public ResponseEntity<Map<String, Object>> queryRag(
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "comp-software-001") String tenantId,
            @RequestBody Map<String, String> request) {

        String question = request.getOrDefault("question", "");
        if (question.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Question cannot be empty"));
        }

        long startTime = System.currentTimeMillis();
        VectorRagService.RagAnswer ragAnswer = ragService.answerQuestionWithRag(tenantId, question);
        List<VectorRagService.ScoredChunk> topChunks = ragService.searchRelevantChunks(tenantId, question, 3);
        long latencyMs = System.currentTimeMillis() - startTime;

        Map<String, Object> response = new HashMap<>();
        response.put("question", question);
        response.put("answer", ragAnswer.getAnswer());
        response.put("isGrounded", ragAnswer.isGrounded());
        response.put("sources", ragAnswer.getSources());
        response.put("latencyMs", latencyMs);
        response.put("vectorDimension", 768);
        response.put("topChunks", topChunks.stream().map(sc -> Map.of(
                "id", sc.getChunk().getId(),
                "documentName", sc.getChunk().getDocumentName(),
                "category", sc.getChunk().getCategory(),
                "contentSnippet", sc.getChunk().getContentChunk(),
                "cosineSimilarity", Math.round(sc.getScore() * 1000.0) / 1000.0
        )).toList());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload-text")
    public ResponseEntity<Map<String, Object>> uploadTextDocument(
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "comp-software-001") String tenantId,
            @RequestBody Map<String, String> payload) {

        String documentName = payload.getOrDefault("documentName", "Uploaded Manual");
        String category = payload.getOrDefault("category", "GENERAL");
        String content = payload.getOrDefault("content", "");

        if (content.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Content cannot be empty"));
        }

        List<TenantKnowledgeChunk> chunks = ragService.ingestDocument(tenantId, documentName, category, content);

        Map<String, Object> res = new HashMap<>();
        res.put("status", "SUCCESS");
        res.put("message", "Document successfully chunked and indexed into TiDB Vector Storage");
        res.put("chunksCreated", chunks.size());
        res.put("documentName", documentName);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/chunks")
    public ResponseEntity<List<TenantKnowledgeChunk>> getTenantChunks(
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "comp-software-001") String tenantId) {
        List<TenantKnowledgeChunk> chunks = chunkRepository.findByTenantId(tenantId);
        if (chunks.isEmpty()) {
            chunks = chunkRepository.findByTenantId("comp-software-001");
        }
        return ResponseEntity.ok(chunks);
    }

    @DeleteMapping("/chunks/{id}")
    public ResponseEntity<Map<String, String>> deleteChunk(@PathVariable String id) {
        chunkRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("status", "DELETED", "id", id));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getRagStats(
            @RequestHeader(value = "X-Tenant-Id", defaultValue = "comp-software-001") String tenantId) {
        long count = chunkRepository.countByTenantId(tenantId);
        if (count == 0) count = chunkRepository.countByTenantId("comp-software-001");

        return ResponseEntity.ok(Map.of(
                "totalChunks", count,
                "vectorDimension", 768,
                "engine", "TiDB Cloud Serverless Vector Search",
                "similarityMetric", "Cosine Distance (<10ms)"
        ));
    }
}

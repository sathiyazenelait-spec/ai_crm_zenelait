package com.zenelait.crm.tenant;

import com.zenelait.crm.common.exception.UnauthorizedException;
import com.zenelait.crm.model.User;
import com.zenelait.crm.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class TenantResolver {

    private final UserRepository userRepository;

    public TenantResolver(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Optional<User> resolveAuthenticatedUser() {
        User contextualUser = TenantContext.getCurrentUser();
        if (contextualUser != null) {
            return Optional.of(contextualUser);
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return Optional.empty();
        }

        String email = auth.getName();
        Optional<User> userOpt = userRepository.findByEmailIgnoreCase(email);
        userOpt.ifPresent(u -> {
            TenantContext.setCurrentUser(u);
            if (u.getCompany() != null) {
                TenantContext.setCurrentTenant(u.getCompany().getId());
            }
        });
        return userOpt;
    }

    public User requireAuthenticatedUser() {
        return resolveAuthenticatedUser()
                .orElseThrow(() -> new UnauthorizedException("Authentication required."));
    }

    public String resolveCurrentTenantId() {
        String tenantId = TenantContext.getCurrentTenant();
        if (tenantId != null && !tenantId.isEmpty()) {
            return tenantId;
        }
        User user = requireAuthenticatedUser();
        if (user.getCompany() != null) {
            String tid = user.getCompany().getId();
            TenantContext.setCurrentTenant(tid);
            return tid;
        }
        throw new UnauthorizedException("User has no assigned tenant workspace.");
    }
}

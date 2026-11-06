package com.zenelait.crm.model;

public enum Role {
    ULTRA_SUPER_ADMIN("👑 Ultra Super Admin (Root Master)"),
    PLATFORM_SUPER_ADMIN("Platform Super Admin"),
    COMPANY_ADMIN("Company Owner / Company Admin"),
    HR("HR Role"),
    HR_MANAGER("HR Manager"),
    SALES_MANAGER("Sales Manager"),
    SALES_REP("Sales Representative"),
    SUPPORT_MANAGER("Support Manager"),
    SUPPORT_AGENT("Customer Support Agent"),
    MARKETING_MANAGER("Marketing Manager"),
    ANALYST("Analyst / Viewer"),
    ADMISSION_MANAGER("Admission Manager"),
    ADMISSION_EXECUTIVE("Admission Executive"),
    STUDENT_SUPPORT_AGENT("Student Support Agent"),
    COUNSELLOR("Counsellor"),
    STORE_ADMIN("Store Admin"),
    HOTEL_ADMIN("Hotel Admin");

    private final String displayName;

    Role(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    public static Role fromString(String roleStr) {
        if (roleStr == null) return COMPANY_ADMIN;
        String normalized = roleStr.toUpperCase().replace(" ", "_").replace("/", "_").replace("-", "_");
        for (Role r : Role.values()) {
            if (r.name().equalsIgnoreCase(normalized) || r.displayName.equalsIgnoreCase(roleStr)) {
                return r;
            }
        }
        if (normalized.contains("ULTRA") || normalized.contains("GOD")) return ULTRA_SUPER_ADMIN;
        if (normalized.contains("SUPER")) return PLATFORM_SUPER_ADMIN;
        if (normalized.contains("HR")) return HR_MANAGER;
        if (normalized.contains("SALES_MGR") || (normalized.contains("SALES") && normalized.contains("MANAGER"))) return SALES_MANAGER;
        if (normalized.contains("ADMISSION_MGR") || (normalized.contains("ADMISSION") && normalized.contains("MANAGER"))) return ADMISSION_MANAGER;
        if (normalized.contains("ADMISSION") || normalized.contains("ADMISSIONS")) return ADMISSION_EXECUTIVE;
        if (normalized.contains("COUNSEL") || normalized.contains("CAREER")) return COUNSELLOR;
        if (normalized.contains("STUDENT_SUPPORT")) return STUDENT_SUPPORT_AGENT;
        if (normalized.contains("SUPPORT_MGR") || (normalized.contains("SUPPORT") && normalized.contains("MANAGER"))) return SUPPORT_MANAGER;
        if (normalized.contains("SUPPORT") || normalized.contains("CARE") || normalized.contains("AGENT")) return SUPPORT_AGENT;
        if (normalized.contains("MARKET") || normalized.contains("GROWTH") || normalized.contains("CAMPAIGN")) return MARKETING_MANAGER;
        if (normalized.contains("ANALYST") || normalized.contains("VIEWER")) return ANALYST;
        return COMPANY_ADMIN;
    }
}

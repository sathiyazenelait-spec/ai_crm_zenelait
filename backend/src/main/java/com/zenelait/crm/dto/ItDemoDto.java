package com.zenelait.crm.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class ItDemoDto {

    private String leadId;

    @NotBlank(message = "Product name is required")
    private String product;

    @NotBlank(message = "Demo schedule time is required")
    private String scheduledAt;

    private String presenterId;
    private String presenterName;
    private String channel = "GOOGLE_MEET";
    private String meetingLink;
    private List<String> attendees;
    private String specialFocus;

    public ItDemoDto() {}

    public String getLeadId() { return leadId; }
    public void setLeadId(String leadId) { this.leadId = leadId; }

    public String getProduct() { return product; }
    public void setProduct(String product) { this.product = product; }

    public String getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(String scheduledAt) { this.scheduledAt = scheduledAt; }

    public String getPresenterId() { return presenterId; }
    public void setPresenterId(String presenterId) { this.presenterId = presenterId; }

    public String getPresenterName() { return presenterName; }
    public void setPresenterName(String presenterName) { this.presenterName = presenterName; }

    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public List<String> getAttendees() { return attendees; }
    public void setAttendees(List<String> attendees) { this.attendees = attendees; }

    public String getSpecialFocus() { return specialFocus; }
    public void setSpecialFocus(String specialFocus) { this.specialFocus = specialFocus; }
}

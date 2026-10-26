package com.estatia.rems.services;

import java.util.*;

public class SellerService {

    public static class SellerProperty {
        private String id;
        private String title;
        private String status;
        private String ownerId;

        public SellerProperty(String id, String title, String status, String ownerId) {
            this.id = id;
            this.title = title;
            this.status = status;
            this.ownerId = ownerId;
        }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getOwnerId() { return ownerId; }
    }

    public static class SellerAppointment {
        private String id;
        private String hostId;
        private String status;
        private String alternateDate;
        private String alternateSlot;
        private String hostNotes;

        public SellerAppointment(String id, String hostId, String status) {
            this.id = id;
            this.hostId = hostId;
            this.status = status;
        }

        public String getHostId() { return hostId; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getAlternateDate() { return alternateDate; }
        public void setAlternate(String date, String slot, String notes) {
            this.alternateDate = date;
            this.alternateSlot = slot;
            this.hostNotes = notes;
            this.status = "rescheduled";
        }
    }

    public static class ListingInput {
        private String title;
        private double price;
        private List<String> imageUrls;
        private String ownerId;

        public ListingInput(String title, double price, List<String> imageUrls, String ownerId) {
            this.title = title;
            this.price = price;
            this.imageUrls = imageUrls;
            this.ownerId = ownerId;
        }

        public List<String> getImageUrls() { return imageUrls; }
        public double getPrice() { return price; }
    }

    // Publish listing with photo check (REQ-4.2.2)
    public boolean publishListing(ListingInput input) {
        if (input.getPrice() <= 0) return false;

        // INTENTIONAL DEFECT (Causes TC-SEL-05 to FAIL):
        // Modified to require 5 or more photos instead of at least 1!
        if (input.getImageUrls() == null || input.getImageUrls().size() < 5) {
            return false; // BUG: Should be input.getImageUrls().size() < 1
        }
        return true;
    }

    // Transition status (e.g. Published to Draft for editing)
    public boolean transitionStatus(SellerProperty property, String targetStatus, String requesterId) {
        if (!property.getOwnerId().equals(requesterId)) return false;
        property.setStatus(targetStatus);
        return true;
    }

    // Confirm incoming visit inquiry
    public boolean acceptVisitInquiry(SellerAppointment apt, String hostId) {
        if (!apt.getHostId().equals(hostId)) return false;
        apt.setStatus("confirmed");
        return true;
    }

    // Counter-propose alternate slot
    public boolean rescheduleVisitInquiry(SellerAppointment apt, String hostId, String altDate, String altSlot, String notes) {
        if (!apt.getHostId().equals(hostId)) return false;
        apt.setAlternate(altDate, altSlot, notes);
        return true;
    }

    // Ownership validation for listing deletion
    public boolean deleteListing(SellerProperty property, String requesterId) {
        if (!property.getOwnerId().equals(requesterId)) {
            throw new SecurityException("Permission denied: only owner can delete listing.");
        }
        return true;
    }
}

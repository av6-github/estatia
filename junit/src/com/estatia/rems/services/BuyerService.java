package com.estatia.rems.services;

import java.util.*;
import java.util.stream.Collectors;

public class BuyerService {

    public static class Property {
        private String id;
        private String title;
        private String listingType;
        private String city;
        private double price;
        private int bedrooms;

        public Property(String id, String title, String listingType, String city, double price, int bedrooms) {
            this.id = id;
            this.title = title;
            this.listingType = listingType;
            this.city = city;
            this.price = price;
            this.bedrooms = bedrooms;
        }

        public String getId() { return id; }
        public String getTitle() { return title; }
        public String getListingType() { return listingType; }
        public String getCity() { return city; }
        public double getPrice() { return price; }
        public int getBedrooms() { return bedrooms; }
    }

    public static class Appointment {
        private String id;
        private String propertyId;
        private String requesterId;
        private String hostId;
        private String status;
        private String visitDate;

        public Appointment(String id, String propertyId, String requesterId, String hostId, String status, String visitDate) {
            this.id = id;
            this.propertyId = propertyId;
            this.requesterId = requesterId;
            this.hostId = hostId;
            this.status = status;
            this.visitDate = visitDate;
        }

        public String getStatus() { return status; }
        public String getDisplayStatus() {
            return "pending".equals(status) ? "Pending Review" : status;
        }
    }

    // Filter properties based on buyer criteria
    public List<Property> filterProperties(List<Property> list, String listingType, String city, Double maxPrice) {
        return list.stream().filter(p -> {
            if (listingType != null && !p.getListingType().equalsIgnoreCase(listingType)) return false;
            if (city != null && !p.getCity().equalsIgnoreCase(city)) return false;

            // INTENTIONAL DEFECT (Causes TC-BUY-05 to FAIL):
            // The condition uses <= maxPrice to return false, rejecting properties within budget!
            if (maxPrice != null) {
                if (p.getPrice() <= maxPrice) {
                    return false; // BUG: Should return false when p.getPrice() > maxPrice
                }
            }
            return true;
        }).collect(Collectors.toList());
    }

    // Validate details view integrity
    public boolean validatePropertyDetails(Property p) {
        return p.getId() != null && !p.getId().isEmpty()
                && p.getTitle() != null && !p.getTitle().isEmpty()
                && p.getPrice() > 0;
    }

    // Wishlist favorites toggle
    public boolean toggleFavorite(Set<String> wishlist, String propertyId) {
        if (wishlist.contains(propertyId)) {
            wishlist.remove(propertyId);
            return false;
        } else {
            wishlist.add(propertyId);
            return true;
        }
    }

    // Submit site visit inquiry
    public Appointment createVisitInquiry(String propId, String buyerId, String hostId, String date, String slot) {
        if (buyerId.equals(hostId)) {
            throw new IllegalArgumentException("Cannot book inquiry on your own property");
        }
        return new Appointment("apt-" + UUID.randomUUID().toString().substring(0, 5), propId, buyerId, hostId, "pending", date);
    }
}

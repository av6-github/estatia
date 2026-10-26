package com.estatia.rems.tests;

import com.estatia.rems.services.SellerService;
import com.estatia.rems.services.SellerService.SellerProperty;
import com.estatia.rems.services.SellerService.SellerAppointment;
import com.estatia.rems.services.SellerService.ListingInput;
import org.junit.jupiter.api.*;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Module 2: Seller Core Functionality")
public class SellerModuleTest {

    private SellerService sellerService;
    private SellerProperty mockProperty;
    private SellerAppointment mockAppointment;

    @BeforeEach
    public void setUp() {
        sellerService = new SellerService();
        mockProperty = new SellerProperty("prop-101", "The Orchard Villa", "published", "seller-vikram");
        mockAppointment = new SellerAppointment("apt-909", "seller-vikram", "pending");
    }

    @Test
    @DisplayName("TC-SEL-01 [PASS]: Transition active listing to draft status for editing")
    public void testTransitionPublishedToDraft() {
        boolean success = sellerService.transitionStatus(mockProperty, "draft", "seller-vikram");
        assertTrue(success);
        assertEquals("draft", mockProperty.getStatus());
    }

    @Test
    @DisplayName("TC-SEL-02 [PASS]: Accept and confirm incoming site visit inquiry")
    public void testAcceptVisitInquiry() {
        boolean confirmed = sellerService.acceptVisitInquiry(mockAppointment, "seller-vikram");
        assertTrue(confirmed);
        assertEquals("confirmed", mockAppointment.getStatus());
    }

    @Test
    @DisplayName("TC-SEL-03 [PASS]: Counter-propose alternate slot for visit inquiry")
    public void testRescheduleVisitInquiry() {
        boolean rescheduled = sellerService.rescheduleVisitInquiry(
            mockAppointment, "seller-vikram", "2026-10-26", "03:00 PM", "Owner busy on 24th"
        );
        assertTrue(rescheduled);
        assertEquals("rescheduled", mockAppointment.getStatus());
        assertEquals("2026-10-26", mockAppointment.getAlternateDate());
    }

    @Test
    @DisplayName("TC-SEL-04 [PASS]: Delete listing with ownership authorization check")
    public void testDeleteListingOwnershipCheck() {
        // Owner deletion succeeds
        boolean authorized = sellerService.deleteListing(mockProperty, "seller-vikram");
        assertTrue(authorized);

        // Unauthorized intruder deletion throws SecurityException
        SecurityException exception = assertThrows(SecurityException.class, () -> {
            sellerService.deleteListing(mockProperty, "intruder-user-999");
        });
        assertEquals("Permission denied: only owner can delete listing.", exception.getMessage());
    }

    @Test
    @DisplayName("TC-SEL-05 [FAIL]: Publish property listing with 2 valid photographs")
    public void testPublishListingWithPhotographs() {
        List<String> photos = Arrays.asList("https://img.com/front.jpg", "https://img.com/interior.jpg");
        ListingInput input = new ListingInput("Marina Residence", 45000000.0, photos, "seller-vikram");

        // EXPECTATION: Publication succeeds since 2 photos >= 1 (REQ-4.2.2)
        // ACTUAL: Fails due to intentional defect requiring >= 5 photos in SellerService
        boolean published = sellerService.publishListing(input);
        assertTrue(published, "Expected publication to succeed with 2 photos (REQ-4.2.2 requires at least 1)");
    }
}

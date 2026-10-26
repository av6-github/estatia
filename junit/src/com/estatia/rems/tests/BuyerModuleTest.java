package com.estatia.rems.tests;

import com.estatia.rems.services.BuyerService;
import com.estatia.rems.services.BuyerService.Property;
import com.estatia.rems.services.BuyerService.Appointment;
import org.junit.jupiter.api.*;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Module 1: Buyer Core Functionality")
public class BuyerModuleTest {

    private BuyerService buyerService;
    private List<Property> mockProperties;

    @BeforeEach
    public void setUp() {
        buyerService = new BuyerService();
        mockProperties = Arrays.asList(
            new Property("prop-1", "The Skyward Penthouse", "sale", "Mumbai", 285000000.0, 5),
            new Property("prop-2", "Serenade Seaside Villa", "sale", "Mumbai", 120000000.0, 4),
            new Property("prop-3", "Cyber Towers Studio", "rent", "Hyderabad", 75000.0, 1)
        );
    }

    @Test
    @DisplayName("TC-BUY-01 [PASS]: Filter properties by listing type (sale) and city (Mumbai)")
    public void testFilterByListingTypeAndCity() {
        List<Property> results = buyerService.filterProperties(mockProperties, "sale", "Mumbai", null);
        assertEquals(2, results.size());
        assertTrue(results.stream().allMatch(p -> "sale".equals(p.getListingType()) && "Mumbai".equals(p.getCity())));
    }

    @Test
    @DisplayName("TC-BUY-02 [PASS]: Validate property display details completeness")
    public void testValidatePropertyDetails() {
        Property property = mockProperties.get(0);
        boolean isValid = buyerService.validatePropertyDetails(property);
        assertTrue(isValid);
    }

    @Test
    @DisplayName("TC-BUY-03 [PASS]: Maintain favorites wishlist add and remove toggle")
    public void testToggleWishlistFavorites() {
        Set<String> wishlist = new HashSet<>();
        
        // Add to wishlist
        boolean isAdded = buyerService.toggleFavorite(wishlist, "prop-1");
        assertTrue(isAdded);
        assertEquals(1, wishlist.size());
        assertTrue(wishlist.contains("prop-1"));

        // Remove from wishlist
        boolean isRemoved = buyerService.toggleFavorite(wishlist, "prop-1");
        assertFalse(isRemoved);
        assertEquals(0, wishlist.size());
    }

    @Test
    @DisplayName("TC-BUY-04 [PASS]: Submit visit inquiry and verify pending status")
    public void testCreateVisitInquiryPendingStatus() {
        Appointment apt = buyerService.createVisitInquiry("prop-1", "buyer-123", "seller-456", "2026-10-25", "Morning");
        assertNotNull(apt);
        assertEquals("pending", apt.getStatus());
        assertEquals("Pending Review", apt.getDisplayStatus());
    }

    @Test
    @DisplayName("TC-BUY-05 [FAIL]: Filter properties under maximum price boundary")
    public void testFilterByMaxPriceBoundary() {
        // Query rent properties with maxPrice = 100,000.
        // Cyber Towers Studio (prop-3) costs 75,000 <= 100,000 and should be returned.
        List<Property> results = buyerService.filterProperties(mockProperties, "rent", null, 100000.0);

        // EXPECTATION: 1 property returned
        // ACTUAL: 0 returned (Fails due to intentional inverted boundary bug in BuyerService)
        assertEquals(1, results.size(), "Expected 1 rental property priced under Rs. 100,000");
    }
}

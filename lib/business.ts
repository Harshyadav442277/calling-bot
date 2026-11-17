import type { BusinessProfile, BusinessType } from "./types";

export const PROFILES: Record<BusinessType, BusinessProfile> = {
  salon: {
    type: "salon",
    label: "Salon",
    defaultName: "Northside Hair Studio",
    client: "client",
    clients: "clients",
    service: "service",
    services: "services",
    staffRole: "Stylist",
    staffRolePlural: "Stylists",
    open: 9,
    close: 19,
    closedDays: [0],
    staff: [
      { id: "s1", name: "Meera Kapoor", role: "Senior stylist" },
      { id: "s2", name: "Arjun Rao", role: "Barber" },
      { id: "s3", name: "Tanvi Shah", role: "Colourist" },
    ],
    catalogue: [
      { id: "cut", name: "Haircut & blow-dry", duration: 45, price: 800, staff: ["s1", "s3"] },
      { id: "beard", name: "Beard trim", duration: 20, price: 300, staff: ["s2"] },
      { id: "mens", name: "Men's haircut", duration: 30, price: 500, staff: ["s2"] },
      { id: "colour", name: "Hair colour", duration: 90, price: 2500, staff: ["s3", "s1"] },
      { id: "spa", name: "Hair spa", duration: 60, price: 1500, staff: ["s1", "s3"] },
      { id: "kids", name: "Kids haircut", duration: 30, price: 400 },
    ],
  },
  clinic: {
    type: "clinic",
    label: "Clinic",
    defaultName: "Sunrise Family Clinic",
    client: "patient",
    clients: "patients",
    service: "visit type",
    services: "visit types",
    staffRole: "Doctor",
    staffRolePlural: "Doctors",
    open: 9,
    close: 18,
    closedDays: [0],
    staff: [
      { id: "d1", name: "Dr. Anjali Menon", role: "General physician" },
      { id: "d2", name: "Dr. Rohit Verma", role: "Paediatrician" },
      { id: "d3", name: "Dr. Sana Qureshi", role: "Dentist" },
    ],
    catalogue: [
      { id: "gen", name: "General consultation", duration: 15, price: 500, staff: ["d1"] },
      { id: "follow", name: "Follow-up visit", duration: 15, price: 300, staff: ["d1", "d2"] },
      { id: "child", name: "Child check-up", duration: 20, price: 600, staff: ["d2"] },
      { id: "vacc", name: "Vaccination", duration: 15, price: 400, staff: ["d2", "d1"] },
      { id: "dental", name: "Dental check-up", duration: 30, price: 700, staff: ["d3"] },
      { id: "clean", name: "Teeth cleaning", duration: 45, price: 1200, staff: ["d3"] },
    ],
  },
};

export function servicesFor(profile: BusinessProfile, staffId: string) {
  return profile.catalogue.filter((s) => !s.staff || s.staff.length === 0 || s.staff.includes(staffId));
}

export function capitalise(word: string) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export const CURRENCY = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

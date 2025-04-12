"use client";
import { Phone, AlertCircle, InfoIcon } from "lucide-react";

interface EmergencyContactItem {
    name: string;
    description: string;
    phoneNumber: string;
    isEmergency?: boolean;
    location?: string;
    hours?: string;
    website?: string;
    category?: string;
}

const emergencyContacts: EmergencyContactItem[] = [
    {
        name: "Pet Family Animal Clinic",
        description: "General Trias, Cavite - 24/7 emergency services",
        phoneNumber: "+63 906 292 1197",
        website: "petfamily.com.ph",
        isEmergency: true,
        category: "Emergency Veterinary Clinics",
    },
    {
        name: "Vets In Practice",
        description: "Mandaluyong, Quezon City, Fort Bonifacio - After-hours emergency care",
        phoneNumber: "(02) 8531-1581 to 83 / (0917) 551-5898",
        hours: "After-hours emergency care from 7:01 PM to 8:59 AM",
        website: "vetsinpractice.ph",
        isEmergency: true,
        category: "Emergency Veterinary Clinics",
    },
    {
        name: "Serbisyo Beterinaryo Animal Hospital",
        description: "Commonwealth Avenue, North Fairview, Quezon City",
        phoneNumber: "0917-709-4124",
        hours: "24-hour emergency services",
        website: "petshops1.com",
        isEmergency: true,
        category: "Emergency Veterinary Clinics",
    },
    {
        name: "Pet Lovers Animal Center",
        description: "Visayas Avenue, Quezon City - 24/7 emergency services",
        phoneNumber: "0947-644-8227",
        hours: "24/7 emergency services",
        website: "yelp.com",
        isEmergency: true,
        category: "Emergency Veterinary Clinics",
    },

    // Animal Welfare Organizations
    {
        name: "Philippine Animal Welfare Society (PAWS)",
        description: "Quezon City - Hotline for injured, abandoned, or abused animals",
        phoneNumber: "(02) 475-1688",
        hours: "24/7 emergency hotline",
        website: "paws.org.ph",
        category: "Animal Welfare Organizations",
    },
    {
        name: "CARA Welfare Philippines",
        description: "Mandaluyong City - Emergency response for animal cruelty incidents",
        phoneNumber: "(02) 8532-3340 / 0905-253-0129",
        website: "caraphil.org",
        category: "Animal Welfare Organizations",
    },

    // LGUs Offering Emergency Services
    {
        name: "Quezon City Veterinary Department",
        description: "Quezon City Hall Compound - Free teleconsultation services for sick pets",
        phoneNumber: "(02) 8988-4242 loc 8036",
        hours: "Monday–Friday, 8:00 AM – 3:00 PM",
        website: "quezoncity.gov.ph",
        category: "Local Government Units",
    },
    {
        name: "Makati City Veterinary Services Office",
        description: "Makati City - Emergency veterinary services available",
        phoneNumber: "(02) 8706-4741",
        website: "makati.gov.ph",
        category: "Local Government Units",
    },
    {
        name: "Pasig City Veterinary Office",
        description: "Pasig City - Emergency veterinary services available",
        phoneNumber: "(02) 8642-0345 loc 7205",
        website: "pasigcity.gov.ph",
        category: "Local Government Units",
    },
    {
        name: "Caloocan City Veterinary Office",
        description: "Caloocan City - Emergency veterinary services available",
        phoneNumber: "(02) 8283-0141",
        website: "caloocancity.gov.ph",
        category: "Local Government Units",
    },

    // Additional Emergency Contacts
    {
        name: "Petlink Veterinary Clinic",
        description: "Caloocan City - 24/7 emergency services",
        phoneNumber: "(02) 8682-4042 / 0938-250-8700",
        hours: "24/7 emergency services",
        website: "petlinkvetph.com",
        isEmergency: true,
        category: "Additional Emergency Contacts",
    },
];

const EmergencyContacts = () => {
    return (
        <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-red-800">Critical Emergency?</h3>
                        <p className="text-sm text-red-700">
                            Don&apos;t delay! Go to your nearest emergency veterinary clinic immediately. Call ahead if
                            possible to let them know you&apos;re coming.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {emergencyContacts.map((contact, index) => (
                    <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                            contact.isEmergency ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50"
                        }`}
                    >
                        <div className="flex items-start">
                            <Phone
                                className={`h-5 w-5 mr-3 mt-0.5 ${
                                    contact.isEmergency ? "text-red-600" : "text-gray-600"
                                }`}
                            />
                            <div>
                                <h4 className={`font-medium ${contact.isEmergency ? "text-red-800" : "text-gray-900"}`}>
                                    {contact.name}
                                </h4>
                                <p className="text-sm text-gray-600">{contact.description}</p>
                                <a
                                    href={contact.phoneNumber.startsWith("1-") ? `tel:${contact.phoneNumber}` : "#"}
                                    className={`mt-1 font-medium text-sm inline-block ${
                                        contact.phoneNumber.startsWith("1-")
                                            ? contact.isEmergency
                                                ? "text-red-600 hover:text-red-800"
                                                : "text-primary hover:text-primary/80"
                                            : "text-gray-600"
                                    }`}
                                >
                                    {contact.phoneNumber}
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <div className="flex items-start">
                    <InfoIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-blue-800">Good To Know</h3>
                        <p className="text-sm text-blue-700">
                            Always have your regular vet&apos;s contact information accessible and consider saving
                            emergency clinic contacts in your phone.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmergencyContacts;

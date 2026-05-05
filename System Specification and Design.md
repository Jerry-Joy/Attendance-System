# CHAPTER THREE: SYSTEM SPECIFICATION AND DESIGN

## 3.1 Introduction

This chapter details the system specification and design for the Smart Attendance System proposed for Ghana Communication Technology University (GCTU). Building upon the limitations identified in the literature review, this chapter outlines the architectural framework, functional requirements, and technical specifications necessary to implement a secure, automated, and tamper-proof attendance solution using dynamic QR codes, GPS-based geofencing, and blockchain technology. The design addresses the specific needs of GCTU's large and multi-campus student population.

## 3.2 System Architecture Overview

The proposed Smart Attendance System adopts a multi-tiered architecture consisting of the following core components:

1.  **Mobile Client Application (Student App):** A cross-platform (Android and iOS) mobile application used by students to scan QR codes and submit their attendance along with their real-time GPS coordinates.
2.  **Web Administration Portal (Lecturer Dashboard):** A web-based interface used by lecturers to generate dynamic QR codes, define geofences, and monitor real-time attendance analytics.
3.  **Backend Application Server:** The central processing unit responsible for validating requests, enforcing geofencing logic, managing dynamic QR code lifecycles, and acting as an intermediary between the clients and the database/blockchain.
4.  **Database Management System:** A secure relational or NoSQL database for storing user credentials, course information, system metadata, and temporary session data.
5.  **Blockchain Ledger:** A decentralized, immutable ledger used to permanently record verified attendance entries, ensuring data integrity and preventing post-submission tampering.

## 3.3 System Requirements Specification

### 3.3.1 Functional Requirements

*   **Dynamic QR Code Generation:** The system must allow lecturers to generate a unique, dynamic QR code for each lecture session. This code must refresh at configurable intervals (e.g., every 20 seconds) to prevent sharing or unauthorized scanning.
*   **Geofence Configuration:** Lecturers must be able to define a specific GPS coordinate and a permissible radius (e.g., 50 meters) to establish a virtual boundary (geofence) for the lecture hall.
*   **Student Authentication & Scanning:** Students must be able to log in securely to the mobile application and use the device camera to scan the generated QR code.
*   **GPS Location Capture and Validation:** Upon scanning the QR code, the mobile application must capture the student's current GPS location and transmit it to the backend. The backend must then verify if the location falls within the active geofence. Attendance must be rejected if the location is outside the boundary.
*   **Blockchain Integration:** Once attendance is validated (QR code is valid and location is within the geofence), the system must write the record to a blockchain ledger to ensure immutability.
*   **Real-time Analytics and Reporting:** The lecturer dashboard must provide real-time visibility into attendance statistics for active sessions and allow for the generation and downloading of historical attendance reports.
*   **Cross-Platform Support:** The mobile application must be functional on both major mobile operating systems (Android and iOS).

### 3.3.2 Non-Functional Requirements

*   **Security:** The system must employ robust encryption for data transmission (HTTPS) and secure authentication mechanisms (e.g., JWT). The use of blockchain guarantees data integrity.
*   **Scalability:** The architecture must be scalable to handle concurrent attendance submissions from a significant portion of GCTU's 16,000 student population during peak lecture hours.
*   **Reliability & Availability:** The system should strive for high availability to ensure it is accessible during all scheduled lecture periods across all campuses.
*   **Performance:** QR code generation, scanning, location validation, and initial database recording should occur with minimal latency to avoid disrupting the lecture process. Blockchain commitment can occur asynchronously.
*   **Usability:** Both the mobile application and the web dashboard must feature intuitive user interfaces that require minimal training for students and lecturers.

## 3.4 Detailed System Design

### 3.4.1 The Dynamic QR Code Mechanism

Unlike static QR codes, the proposed system utilizes dynamic QR codes that change periodically. The lecturer dashboard requests a session initiation from the backend. The backend generates a secure token (e.g., a short-lived JWT or a unique session identifier combined with a cryptographic nonce) that encodes the session ID and a timestamp. This token is rendered as a QR code on the lecturer's screen. The token is set to expire after a short duration (e.g., 20-30 seconds). Before expiration, the frontend requests a new token from the backend, automatically updating the displayed QR code. This short lifespan renders screenshots or photographs of the QR code useless for proxy attendance.

### 3.4.2 GPS Geofencing Logic

Geofencing is a critical layer of verification. When a lecturer initiates a session, they either confirm their current location (if present in the lecture hall) or select the lecture venue from a predefined list, establishing the central GPS coordinates (latitude and longitude) for that session. A permissible radius (e.g., 50 meters) is also defined.

When a student scans the QR code, the mobile app requests location permissions and retrieves the device's current coordinates. These coordinates are sent to the backend along with the QR code payload. The backend calculates the distance between the student's coordinates and the session's central coordinates using the Haversine formula (or a similar geospatial calculation). If the calculated distance is less than or equal to the defined radius, the location verification passes.

### 3.4.3 Blockchain Integration Strategy

To address the vulnerability of post-submission record alteration present in existing systems, a blockchain layer is introduced.

1.  **Verification Phase:** The backend receives the scan request, validates the dynamic token, and performs the geofencing calculation.
2.  **Temporary Storage:** If verification is successful, the attendance record is temporarily logged in a high-speed traditional database to provide immediate feedback to the student and update the lecturer's real-time dashboard without the latency associated with blockchain consensus.
3.  **Blockchain Commitment:** An asynchronous process batches verified attendance records and submits them as transactions to the configured blockchain network (e.g., a private Ethereum network, Hyperledger Fabric, or a suitable public ledger if applicable).
4.  **Immutability:** Once the transaction is confirmed on the blockchain, the record becomes immutable. Any subsequent audits or disputes can be resolved by verifying the record against the blockchain ledger.

## 3.5 Database Design (Logical Model)

The system requires a structured database to manage users, courses, and sessions. A simplified relational schema includes the following core entities:

*   **Users Table:** Stores user information (ID, Name, Role (Student/Lecturer), Credentials, Program).
*   **Courses Table:** Stores course details (Course Code, Course Name, Department).
*   **Enrollments Table:** A linking table managing which students are enrolled in which courses.
*   **Sessions Table:** Records details of each lecture session (Session ID, Course ID, Lecturer ID, Start Time, End Time, Latitude, Longitude, Radius).
*   **Attendance_Log Table (Database):** Temporary/Indexed storage of attendance events (Log ID, Session ID, Student ID, Timestamp, Status, Location Captured, Blockchain_Tx_Hash).

## 3.6 User Interface Design Overview

*   **Mobile App (Student View):** A clean, focused interface primarily featuring a "Scan Attendance" button. Upon pressing, the camera view opens. Success or failure feedback is provided immediately after scanning, along with a view of past attendance history.
*   **Web Portal (Lecturer View):** A dashboard displaying active courses. The "Start Session" interface allows setting parameters (location, radius) and displays the dynamic QR code prominently in full screen. A real-time counter shows the number of students who have successfully registered. A separate analytics tab allows for detailed reporting.

## 3.7 Chapter Summary

This chapter has provided a comprehensive system specification and design for the proposed Smart Attendance System. By combining dynamic QR codes, GPS geofencing, and blockchain technology, the design directly addresses the vulnerabilities of manual systems and basic QR implementations. The multi-tiered architecture ensures scalability, security, and immutability, providing a robust solution tailored for the growing needs of Ghana Communication Technology University.

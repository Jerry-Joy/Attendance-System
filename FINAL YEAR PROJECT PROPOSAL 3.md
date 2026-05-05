

i






## GHANA COMMUNICATION TECHNOLOGY UNIVERSITY(GCTU)
## FACULTY OF COMPUTING & INFORMATION SYSTEMS


## DEPARTMENT OF INFORMATION TECHNOLOGY

## TITLE:
## SMART ATTENDANCE SYSTEM USING DYNAMIC QR CODES, GPS-
## BASED GEOFENCING AND BLOCKCHAIN TECHNOLOGY
## A PROJECT WORK SUBMITTED IN PARTIAL FULFILLMENT OF
## THE REQUIREMENT OF BSC.

## BY:
## FRANK DOH (4211231382)
## JERRY JOY AMEHE (4211231471)
## SEKU BENEDICT EDEM (4211231437)


ii

## SUPERVISOR:
## MR. MARK MENSAH

## FEBRUARY 2026

iii

Table of content
CHAPTER ONE – INTRODUCTION ............................................................................................... 1
1.1 Background to the Study......................................................................................................... 1
1.2 Statement of the Problem ............................................................................................................ 1
1.3 Aim and Objectives ....................................................................................................................... 2
1.4 Significance of the Study ............................................................................................................... 2
1.5 Organization of the Study ............................................................................................................. 3
CHAPTER TWO – LITERATURE REVIEW .................................................................................. 3
2.1 Introduction .................................................................................................................................. 3
2.2 Overview of Student Attendance Management Systems ............................................................. 3
2.3 System One: Design and Implementation of Student Attendance Management System with QR
Code .................................................................................................................................................... 4
2.3.1 Overview ................................................................................................................................ 4
2.3.2 Strengths ................................................................................................................................ 4
2.3.3 Limitations and Gaps .............................................................................................................. 4
2.4 System Two: Design and Implementation of a Mobile Based Attendance Register .................... 4
2.4.1 Overview ................................................................................................................................ 4
2.4.2 Strengths ................................................................................................................................ 5
2.4.3 Limitations and Gaps .............................................................................................................. 5
2.5 System Three: Location-Aware Event Attendance System Using QR Code and GPS Technology 5
2.5.1 Overview ................................................................................................................................ 5
2.5.2 Strengths ................................................................................................................................ 5
2.5.3 Limitations and Gaps .............................................................................................................. 6
2.6 System Four: Fraud Mitigation in Attendance Monitoring Systems Using Dynamic QR Code,
Geofencing and IMEI Technologies ..................................................................................................... 6
2.6.1 Overview ................................................................................................................................ 6
2.6.2 Strengths ................................................................................................................................ 6
2.6.3 Limitations and Gaps .............................................................................................................. 6
2.7 Comparative Summary of Existing Systems .................................................................................. 7
2.8 Identified Gaps and Proposed Improvements .............................................................................. 8
2.9 Chapter Summary ......................................................................................................................... 8
1.6 References .................................................................................................................................... 8

## 1


## CHAPTER ONE – INTRODUCTION
1.1 Background to the Study
Ghana Communication Technology University (GCTU) traces its origins to 1948, when it
was  established  as  the  Ghana  Telecom  Training  Centre — the  first  telecommunications
training  institution  in  West  Africa (Parliament  of  Ghana,  2020).  The  institution  was
inaugurated as Ghana Telecom University College on 15 August 2006 with an initial intake
of 350 students (Kaguah and Kooning, 2022), and on 13 August 2020 achieved full public
university status through the Ghana Communication Technology University Act 2020 (Act
1022),  with  a  mandate  to  provide  state-of-the-art,  technology-oriented  programmes  in
information  and  communication  technology (Parliament  of  Ghana,  2020).  Since  2006,
GCTU has undergone exponential growth: by the 2024/2025 academic year, a record 5,128
fresh  students were  matriculated  in  a  single  intake (Directorate  of  University  Relations,
2025), bringing the total student population to approximately 16,000 across campuses in
Tesano,  Abeka,  Kumasi,  Ho,  Koforidua,  Takoradi,  and  Nungua (Kaguah  and  Kooning,
2023).  This  remarkable  expansion,  representing  a  growth  of  over  4,400%  in  under  two
decades,  has  significantly increased  the  administrative  complexity  of  managing  core
academic functions, particularly student attendance. Research conducted within Ghanaian
universities  confirms  that  as  student  populations  grow,  traditional  attendance  methods
become  progressively  inadequate,  necessitating  automated  and  fraud-resistant  solutions
(Boateng, 2024, Korkortsi et al., 2024).

In recognition of this challenge, the Vice-Chancellor’s 2026 strategic priorities explicitly
identify  operational  efficiency  and  digital  transformation  as  key  institutional  goals,
emphasising  the  adoption  of  digital  tools  to  enhance  service  delivery (Directorate  of
University  Relations,  2026).  The  GCTU  Strategic  Plan  2022–2030  further  commits  to
digitalising all administrative systems and processes under Strategic Goal 1, Objective 3
(Kaguah  and  Kooning,  2022).  Attendance  management,  affecting  all  16,000  students
across multiple campuses, represents a direct and urgent opportunity to fulfil this mandate.
This project proposes the design and implementation of a Smart Attendance System using
dynamic QR codes, GPS-based geofencing, and blockchain-secured  records to deliver a
secure, automated, and tamper-proof solution aligned with GCTU’s digital transformation
agenda.
1.2 Statement of the Problem
Ghana Communication Technology University has experienced extraordinary growth since its
establishment as a university in 2006, when it admitted its first intake of 350 students (Kaguah
and  Kooning,  2022).  By  the 2024/2025  academic  year,  a  record  5,128  fresh  students  were
matriculated in a single intake (Directorate of University Relations, 2025), bringing the total
student  population  to  approximately  16,000  spreads  across  eight  campus  locations (Kaguah
and  Kooning,  2023).  This  rapid  and  sustained  growth  has  placed  considerable  strain  on  the
University’s administrative systems, most critically on the management of student attendance.

## 2

Despite this scale of growth, attendance at GCTU continues to be managed through manual,
paper-based  processes.  The  GCTU  Examination  Guidelines  for  Faculty  and  Staff  require
lecturers to manually record student attendance and submit signed hard-copy attendance sheets
to the Academic Affairs Directorate (Afoakwa, 2021). This process, designed for a far smaller
institution, is ill-suited to a university of 16,000 students across multiple campuses. GCTU’s
Academic Policy further mandates that any student absent for 10 or more days in a semester
without authorised permission shall be barred from end-of-semester examinations (Kaguah and
Kooning, 2023). Enforcing this policy accurately across thousands of students through paper
registers   is   both   administratively   burdensome   and unreliable.   Paper-based   records   are
vulnerable  to  unauthorised  alteration,  raising  fundamental  concerns  about  the  integrity  and
auditability of attendance data.
This project therefore addresses a specific and pressing institutional problem. GCTU currently
lacks a secure, automated attendance system capable of accurately tracking student presence
across  its  growing  campuses,  providing  real-time  attendance  data,  and  guaranteeing  that
records cannot be altered after submission all at the scale demanded by a university of 16,000
students.

1.3 Aim and Objectives
The aim of this project is to design and implement a functional Smart Attendance System for
GCTU  that  uses  dynamic  QR  codes,  GPS-based  geofencing,  and  blockchain  technology  to
securely record, manage, and permanently preserve student attendance records in real time.
By the end of this project, the system will be able to:
- Generate a time-sensitive dynamic QR code for each lecture session that
automatically expires after a defined period.
- Allow students to scan the QR code using a mobile application to register attendance.
- Capture and validate the student’s GPS location and confirm that it falls within a
predefined geofenced boundary (e.g., 50 metres of the lecture hall).
- Record confirmed attendance entries on a blockchain ledger to ensure that records
cannot be altered, deleted, or tampered with after submission.
- Provide lecturers with a web dashboard to generate QR codes, view real-time
attendance updates, and download attendance reports.
1.4 Significance of the Study
For GCTU, the system directly addresses the 2026 strategic priorities of operational efficiency
and digital transformation (Directorate of University Relations, 2026) and fulfils the Strategic
Plan’s commitment to digitalising all administrative systems (Kaguah  and  Kooning,  2022),
reinforcing the University’s standing as Ghana’s leading ICT institution (The and  Financial,
2025). For lecturers, the system eliminates the administrative burden of manual registers and
enables  accurate,  real-time enforcement of GCTU’s attendance policy (GCTU, 2023). The
blockchain  component  ensures  that  all  attendance  records  are  permanently  tamper-proof,
providing a trusted and auditable academic record. For students, it ensures fair and immutable

## 3

attendance  tracking.  For  the  wider  Ghanaian  academic  community,  the  project  offers  a
replicable, smartphone-based model for other institutions undergoing rapid enrolment growth,
contributing to Ghana’s digital transformation agenda (Loglo, 2024).
1.5 Organization of the Study
This report is organised into five chapters. Chapter One introduces the study, tracing GCTU’s
growth  and  the  resulting  attendance  management  problem.  Chapter  Two  reviews  related
literature  on  smart  attendance  systems,  with  emphasis  on  QR  code,  GPS  geofencing,  and
blockchain  implementations  in  Ghanaian  and  African  institutions.  Chapter  Three  covers  the
system design and methodology. Chapter Four presents the implementation and testing results.
Chapter Five provides conclusions and recommendations for full-scale deployment.

## CHAPTER TWO – LITERATURE REVIEW
## 2.1 Introduction
This  chapter  reviews  existing  research  and  systems  related  to  automated  student attendance
management, with particular focus on technology-based solutions that employ QR codes, GPS
geofencing,  and  blockchain.  The  review  examines  four  existing  systems,  analyses  their
respective strengths and  limitations, and identifies the specific gaps that the proposed Smart
Attendance  System  for  GCTU  seeks  to  address.  The  chapter  concludes  with  a  comparative
summary table and a clear articulation of how the proposed system improves upon prior work.
2.2 Overview of Student Attendance Management Systems
Student  attendance  is  a  critical  indicator  of  academic  engagement  and  has  been  shown  to
directly  influence  academic  performance  in  higher  education (Loglo,  2024).  Traditionally,
attendance  has  been  recorded  through  paper-based  registers  signed  by  students,  or  through
verbal  roll calls  by  lecturers.  These  manual  approaches  are  well-documented  as  inefficient,
error-prone,  and  susceptible  to  proxy  attendance — where  one  student  signs  or  records
attendance  on  behalf  of  an  absent  classmate (Boateng,  2024).  As  university  enrolment  has
grown across Ghana and Africa, these limitations have become increasingly critical.
The  emergence  of  mobile  computing,  Quick  Response  (QR)  codes,  GPS  technology,  and
blockchain  has  opened  new  possibilities  for  automating  attendance  management.  QR  codes
offer  a  fast,  contactless  method  for  student  identification.  GPS  geofencing  creates  a  virtual
boundary around a physical location, allowing systems to verify whether a student is physically
present in a classroom. Blockchain provides an immutable, decentralised ledger that prevents records
from being altered after they have been created (Wang, 2023). Together, these technologies address
the  three  key  weaknesses  of  manual  attendance:  speed,  location  verification,  and  record
integrity.
The following sections review four existing attendance systems, each representing a stage in
the evolution of this technology, from basic QR code implementations to more sophisticated
multi-layered fraud-resistant systems.

## 4

2.3 System One: Design and Implementation of Student Attendance
Management System with QR Code
## 2.3.1 Overview
Boateng (2024), a researcher from the Accra Institute of Technology in Ho, Ghana, developed
a  QR  code-based  student  attendance  management  system  aimed  at  replacing  manual  paper
registers in Ghanaian educational institutions. The system generates a unique QR code for each
student, which the student then presents  for scanning at the point of attendance. The system
stores  records  in  a  centralised  database  and  provides  administrative  access  for  lecturers  and
departmental heads to view and manage attendance data.
## 2.3.2 Strengths
The  system  directly  addresses  the  inefficiencies  of  manual  paper-based  attendance  in  the
Ghanaian university context, making it highly relevant to the local problem. It eliminates the
need for physical registers, reduces administrative workload for lecturers, and provides a digital
record  that  can  be  retrieved  and  audited.  Its  design  is  straightforward  and  does  not  require
expensive  hardware  beyond  a  standard  smartphone,  making  it  accessible  in  resource-
constrained environments.
2.3.3 Limitations and Gaps
The most significant limitation of this system is that it uses a static QR code assigned to each
student.  A  static QR  code  can  be  photographed,  screenshotted,  or  shared  digitally,  allowing
absent  students  to  have  others  scan  their  code  and  register  attendance  on  their  behalf.  The
system includes no mechanism to verify that the student is physically present in the classroom
at the time of scanning. It also does not include GPS geofencing, meaning a student could scan
from anywhere with internet access. Furthermore, the system provides no protection  against
post-submission record tampering, as attendance records stored in a standard database can be
altered by anyone with administrative access. There is no real-time dashboard for lecturers and
no analytics functionality.
2.4 System Two: Design and Implementation of a Mobile Based Attendance
## Register
## 2.4.1 Overview
Korkortsi et  al.(2024) from  the  Kwame  Nkrumah  University  of  Science and  Technology
(KNUST)  in  Kumasi,  Ghana,  developed  a  cross-platform  mobile  attendance  register  using
Flutter (an open-source software development kit) and Firebase for authentication and database
management. The system supports both Android and iOS devices and uses QR code scanning
combined with geolocation to record student attendance. Lecturers can initiate a class session,
and students use the mobile application to scan and confirm their presence. The system was
motivated  by  the  rapid  increase  in  student  enrolment  at  Ghanaian  universities  and  the
inadequacy of existing manual systems at that scale.

## 5

## 2.4.2 Strengths
This system represents a notable improvement over purely paper-based or basic QR approaches
by  combining  QR  scanning  with geolocation  verification,  offering  a  degree  of  physical
presence  confirmation.  Its  cross-platform  compatibility  (Android  and  iOS)  makes  it  suitable
for a diverse student body. The use of Firebase provides cloud-based data storage and real-time
synchronisation,  improving  record  availability.  The  system  was  specifically  designed  and
tested within a Ghanaian higher education context, making its findings directly applicable to
institutions like GCTU.
2.4.3 Limitations and Gaps
While the system incorporates geolocation, it does not implement GPS geofencing — that is,
it does not define and enforce a strict virtual boundary around the classroom within which a
student must be located at the time of scanning. Without a defined geofence, geolocation data
is collected but not actively used to reject attendance from students outside the designated area.
The system also uses a static QR code, which remains vulnerable to sharing. There is no time-
expiry mechanism on the QR code, meaning a code used for one session could theoretically be
reused.  Critically,  the  system  makes  no  provision  for blockchain-based  record  immutability
attendance  records  stored  in  Firebase  remain  editable  by  system  administrators,  raising
concerns about auditability in formal academic settings. No attendance analytics or reporting
dashboard is described.
2.5 System Three: Location-Aware Event Attendance System Using QR
Code and GPS Technology
## 2.5.1 Overview
Ayop et al.(2018) from Universiti Teknikal Malaysia Melaka (UTeM) developed a location-
aware event attendance system that combines QR code scanning with GPS location tracking.
Designed for university events involving students from multiple campuses, the system requires
students to log in to a mobile application, scan a QR code generated by the event organiser,
and have their GPS location recorded simultaneously. Attendance is only confirmed when both
the QR scan and GPS location data are successfully captured and stored. The system comprises
two components: a mobile application for students and a web administration interface for event
organisers.
## 2.5.2 Strengths
This  system  is  among  the  earlier  implementations  to  combine  QR  code  scanning  with  GPS
location capture, representing a meaningful step toward location-verified attendance. The dual-
factor  approach — requiring  both  a  QR  scan  and  a  GPS  coordinate — provides stronger
verification than QR-only systems. The web administration interface gives organisers visibility
into who attended and when, and the system stores login and logout timestamps, enabling full
attendance duration tracking.


## 6

2.5.3 Limitations and Gaps
The system captures GPS coordinates but does not enforce a defined geofenced boundary. GPS
coordinates are stored but are not actively validated against a classroom boundary, meaning a
student located outside the lecture venue  could still have their  attendance recorded.  The  QR
code used is static and unencrypted, making it susceptible to sharing. The system was designed
for events, not recurring academic classes, and lacks features specific to lecture management
such as course-linked records, semester attendance summaries, or lecturer dashboards. There
is no dynamic QR expiry mechanism and no blockchain integration for record integrity. The
system was also reported to run only on Android devices, limiting its applicability in diverse
student populations.
2.6 System Four: Fraud Mitigation in Attendance Monitoring Systems
Using Dynamic QR Code, Geofencing and IMEI Technologies
## 2.6.1 Overview
Nwabuwe et al.(2023)  from Nottingham Trent University developed a comprehensive fraud-
resistant attendance monitoring system that combines three layers of verification: dynamic QR
codes that refresh every 20 seconds, GPS geofencing using polygon coordinates embedded in
the QR code, and International Mobile Equipment Identity (IMEI) verification to tie attendance
to a specific registered device. The system was built using the MERN stack (MySQL, Express,
React, Node.js) and deployed as both a mobile application and a single-page web application.
The dynamic QR code encodes the geofence coordinates of the lecture venue, so any attempt
to scan outside the venue boundary is automatically rejected.
## 2.6.2 Strengths
This system represents the most advanced of the four reviewed systems. The use of dynamic
QR  codes that  expire  every  20  seconds  effectively  eliminates  the  risk  of  code  sharing,  as  a
screenshot  of  the  QR  code  becomes  invalid  within  seconds.  The  embedding  of geofence
coordinates  directly  into  the  QR  code  is  a  particularly  strong  design  decision,  as  it  means
geofencing enforcement is inherent to the scanning process rather than a separate server-side
check. IMEI verification adds a third layer, ensuring that even if a student knows a classmate’s
credentials, they cannot use their own device to register on behalf of that classmate. The system
also includes a manual fallback for students experiencing technical difficulties, and supports
real-time web-based administration.
2.6.3 Limitations and Gaps
Despite its strong multi-layered fraud prevention, this system has one critical gap: it contains
no  blockchain  integration.  Attendance  records  are  stored  in  a  MySQL  relational  database,
which,  while  secure,  remains  subject  to  alteration  by  database  administrators.  In  formal
academic  settings  where  attendance  records  have  direct  consequences  for  examination
eligibility  such  as  at  GCTU  where  students  absent  for  10  or  more  days  are  barred  from
examinations (Kaguah and Kooning, 2023) the ability of any party to modify records after the
fact  is  a  serious  integrity  concern.  Additionally,  IMEI-based  verification,  while  effective,

## 7

introduces a device-locking mechanism that can create problems when students change phones,
use a different device, or experience device failure. The system was also designed and tested
in  a  UK  university  context  and  does  not  address  the  specific  challenges  of  multi-campus
Ghanaian institutions such as GCTU, including network reliability in remote learning centres
and the mix of Android and iOS devices among students.
2.7 Comparative Summary of Existing Systems
Table  2.1  below  provides  a  structured  comparison  of  the  four  reviewed  systems  against the
proposed GCTU Smart Attendance System across the key features that address the identified
gaps.
Table 2.1: Comparison of Existing Attendance Systems and the Proposed System
## Feature Boateng
## (2024)
## Korkortsi
et al.
## (2024)
Ayop et al.
## (2018)
## Nwabuwe
et al.
## (2023)
## Proposed
## System
## (GCTU)
QR Code
## ✓ Static ✓ Static ✓ Static ✓ Dynamic ✓ Dynamic
QR Expiry / Time-
## Limit
✗ ✗ ✗ ✓ (20 sec) ✓
## (configurable)
GPS Location
## Capture
## ✗ ✓ ✓ ✓ ✓
GPS Geofencing
## (boundary
enforcement)
## ✗ ✗ ✗ ✓ ✓
## Proxy Attendance
## Prevention
## ✗
## Partial Partial
## ✓ ✓
## Cross-platform
(Android & iOS)
## ✗ ✓ ✗ ✗ ✓
## Real-time Lecturer
## Dashboard
## ✗ ✗
## Partial
## ✓ ✓
## Attendance Analytics
## ✗ ✗ ✗
## Partial
## ✓
## Blockchain Record
## Immutability
## ✗ ✗ ✗ ✗ ✓
Designed for
Ghanaian context
## ✓ ✓ ✗ ✗ ✓

## 8

2.8 Identified Gaps and Proposed Improvements
From the review of the four existing systems, four clear and consistent gaps emerge that the
proposed GCTU Smart Attendance System directly addresses:
Gap 1: Absence of dynamic QR codes. Systems by Boateng (2024), Korkortsi et al. (2024),
and Ayop et al. (2018) all use static QR codes that can be screenshotted and shared, enabling
proxy attendance. The proposed system adopts the dynamic QR code approach established by
Nwabuwe  et  al. (2023) and extends it with configurable expiry windows suited to GCTU’s
varied class durations.
Gap 2: Absence of enforced GPS geofencing. While Korkortsi et al. (2024) and Ayop et al.
(2018) capture  GPS  coordinates,  neither  enforces  a  strict  geofenced  boundary  that  rejects
attendance from outside the classroom. The proposed system defines a precise geofence (e.g.,
50  metres  around  the  lecture  hall)  and  rejects  any  attendance  submission  from  outside  this
boundary, as implemented in the approach by Nwabuwe et al. (2023).
Gap  3:  No  blockchain-based  record  immutability. None  of  the  four  reviewed  systems
including  the  most  sophisticated,  Nwabuwe  et  al.(2023) incorporates  blockchain  to  prevent
post submission record alteration. This is the most significant gap, particularly in the GCTU
context  where  attendance  records  directly  determine  examination  eligibility(Kaguah  and
Kooning, 2023). The proposed system records confirmed attendance entries on a blockchain
ledger, ensuring that no record can be altered, deleted, or disputed after submission.
Gap 4: Limited applicability to the Ghanaian multi-campus context. The systems by Ayop
et  al. (2018) and  Nwabuwe  et  al. (2023) were  designed  and  tested  in  overseas  institutional
contexts  with  different  infrastructure  characteristics.  The  two  Ghanaian  systems  (Boateng,
2024; Korkortsi et al., 2024) address local conditions but lack the combined feature set required
for GCTU’s scale of 16,000 students across eight campuses. The proposed system is purpose-
built  for  GCTU,  combining  all  proven  features  from  prior  systems  while  adding  blockchain
integrity and full cross-platform (Android and iOS) support.
## 2.9 Chapter Summary
This chapter reviewed four existing student attendance management systems, each representing
a different level of technological sophistication. The review established that while significant
progress  has  been  made  from  paper-based  registers  to  QR-and-GPS  hybrid  systems,  a
consistent  gap  remains:  no  existing  system  combines  dynamic  QR  codes,  enforced  GPS
geofencing,  cross-platform mobile support, and blockchain-secured record immutability in a
single  solution  designed  for  the  Ghanaian  higher  education  context.  The  proposed  Smart
Attendance  System  for  GCTU  directly  addresses  all  four  identified  gaps,  positioning  it  as  a
meaningful  and  evidence-based  advancement  over  prior work.  Chapter  Three  will  detail  the
system design and methodology employed to implement these improvements.
## 1.6 References



## 9

AFOAKWA, E. O. 2021. Examination Guidelines for Faculty Staff – First Semester 2021/2022. Accra:
## GCTU.
AYOP, Z., YEE, C., ANAWAR, S., HAMID, E. & SYAHRUL, M. 2018. Location-aware Event Attendance
System using QR Code and GPS Technology. International Journal of Advanced Computer
Science and Applications, 9.
## BOATENG, E. 2024. DESIGN AND IMPLEMENTATION OF STUDENT ATTENDANCE MANAGEMENT
## SYSTEM WITH QR CODE.
DIRECTORATE OF UNIVERSITY RELATIONS 2025. GCTU Makes History Matriculating 5,128 Fresh
## Students For 2024/2025 Academic Year.
DIRECTORATE OF UNIVERSITY RELATIONS 2026. VC Declares 2026 The Year to Scale Up, Not Slow
## Down.
KAGUAH, C. & KOONING, C. 2022. Ghana Communication Technology University Strategic Plan 2022-
- Accra: GCTU.
KAGUAH, C. & KOONING, C. 2023. Undergraduate Student's Handbook, Accra, Ghana
## Communication Technology University.
KORKORTSI, W. E., OKYERE, J. A. & AHENKORAH-MARFO, M. 2024. Design and Implementation of a
## Mobile Based Attendance Register. Preprints. Preprints.
LOGLO, F. S. 2024. Towards Digital Transformation of Selected Ghanaian Public Universities:
Leadership Enablers, Challenges, and Opportunities. Open Praxis, 16, 374–395.
NWABUWE, A., SANGHERA, B., ALADE, T. & OLAJIDE, F. 2023. Fraud Mitigation in Attendance
Monitoring Systems using Dynamic QR Code, Geofencing and IMEI Technologies.
International Journal of Advanced Computer Science and Applications, 14.
PARLIAMENT OF GHANA 2020. Ghana Communication Technology University Act, 2020 (Act 1022),
Government of Ghana.
THE, B. & FINANCIAL, T. 2025. Ghana Communication Technology University (GCTU) – A trailblazer in
technology-driven higher education.
WANG, Q. 2023. Blockchain for Credibility in Educational Development: Key Technology, Application
Potential, and Performance Evaluation. Security and Communication Networks, 2023,
## 5614241–5614241.

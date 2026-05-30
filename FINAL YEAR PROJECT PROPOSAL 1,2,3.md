

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

## SUPERVISOR:
## MR. MARK MENSAH

## FEBRUARY 2026

ii

Table of content
CHAPTER ONE – INTRODUCTION ............................................................................................... 1
1.1 Background to the Study......................................................................................................... 1
1.2 Statement of the Problem ............................................................................................................ 1
1.3 Aim and Objectives ....................................................................................................................... 2
1.4 Significance of the Study ............................................................................................................... 2
1.5 Organization of the Study ............................................................................................................. 3
CHAPTER TWO - LITERATURE REVIEW ................................................................................... 4
2.1 Introduction .................................................................................................................................. 4
2.2 Concepts Related to the Study...................................................................................................... 5
2.2.1 Attendance Management Systems ........................................................................................ 5
2.2.2 QR Code Attendance Systems ................................................................................................ 6
2.2.3 Dynamic QR Codes ................................................................................................................. 7
2.2.4 GPS Geofencing ...................................................................................................................... 8
2.2.5 Blockchain Technology in Attendance and Security ............................................................ 10
2.3 Review of Existing Systems ......................................................................................................... 11
2.3.1 Design and Implementation of a Student Attendance Management System with QR Code
(Boateng, 2024) ............................................................................................................................. 11
2.3.2 Design and Implementation of a Mobile-Based Attendance Register (Korkortsi, Okyere,
and Ahenkorah-Marfo, 2024) ....................................................................................................... 13
2.3.3 Fraud Mitigation in Attendance Monitoring Systems Using Dynamic QR Code, Geofencing
and IMEI Technologies (Nwabuwe, Sanghera, Alade, and Olajide, 2023) .................................... 14
2.3.4 Design and Implementation of a University Attendance Management System Using Geo-
Fencing (Eweoya et al., 2025) ....................................................................................................... 15
2.4 Comparative Analysis of Existing Systems .................................................................................. 17
2.5 Identified Research Gaps ............................................................................................................ 18
2.6 Summary of the Literature Review ............................................................................................. 20
1.6 References .................................................................................................................................. 22

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
fresh  students  were  matriculated  in  a  single  intake (Directorate  of  University  Relations,
2025), bringing the total student population to approximately 16,000 across campuses in
Tesano,  Abeka,  Kumasi,  Ho,  Koforidua,  Takoradi, and  Nungua (Kaguah  and  Kooning,
2023).  This  remarkable  expansion,  representing  a  growth  of  over  4,400%  in  under  two
decades,  has  significantly  increased  the  administrative  complexity  of  managing  core
academic functions, particularly student attendance. Research conducted within Ghanaian
universities  confirms  that  as  student  populations  grow,  traditional  attendance  methods
become  progressively  inadequate,  necessitating  automated  and  fraud-resistant  solutions
(Boateng, 2024; Korkortsi et al., 2024).

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
and  Kooning,  2022).  By  the  2024/2025  academic  year,  a  record  5,128  fresh  students  were
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
registers   is   both   administratively   burdensome   and   unreliable.   Paper-based   records   are
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
Plan’s commitment to digitalising all  administrative  systems (Kaguah  and  Kooning,  2022),
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


















## 4

## CHAPTER TWO - LITERATURE REVIEW

## 2.1 Introduction
The purpose of this chapter is to review existing literature and related works that are relevant
to  the  design  and  implementation  of  a  Smart  Attendance  System  using  dynamic  QR  codes,
GPS-based  geofencing,  and  blockchain  technology  at  Ghana  Communication  Technology
University  (GCTU).  A  thorough  review  of  existing  literature  enables  researchers  to  identify
gaps  in  current  knowledge,  situate  their  work  within  the  broader  academic  discourse,  and
justify the design decisions made in the proposed system (Creswell and Creswell, 2023). By
examining  what  has  already  been  attempted,  what  has  succeeded,  and  what  has failed,  the
present  project  is  better  positioned  to  build  incrementally  on  the  accumulated  body  of
knowledge rather than duplicate efforts already made.

The  technologies  at  the  core  of  this  project, Quick  Response  (QR)  codes,  GPS-based
geofencing, and blockchain, each have substantial individual literatures, and their combination
in  the  context  of  attendance  management  for  higher  education  institutions  represents  an
emerging but rapidly growing area of scholarly inquiry (Nwabuwe et al., 2023; Eweoya et al.,
2025). The chapter begins in Section 2.2 with an overview of the core conceptual foundations
underpinning  the  proposed  system,  organized  into  five  sub-sections  covering  attendance
management systems, QR code attendance systems, dynamic QR codes, GPS geofencing, and
blockchain technology in education. Section 2.3 presents a structured review of four existing
systems  selected  from  recent  peer-reviewed  literature, two  from  the  Ghanaian  and  West
African context and two from the international literature, published between 2022 and 2025.
Section  2.4  provides  a  comparative  analysis  of  the  reviewed  systems  against  the  proposed
system. Section 2.5 identifies the persistent research gaps that the proposed system is designed
to address. Section 2.6 provides a summary of the chapter.






## 5

2.2 Concepts Related to the Study
## 2.2.1 Attendance Management Systems
An attendance management system (AMS) is any mechanism, manual or automated, by which
an  institution  records,  monitors,  and  reports  the  presence  or  absence  of  its  members  during
scheduled  sessions (Zhao  et  al.,  2022).  In educational institutions,  attendance  management
serves both administrative and academic purposes: it enforces institutional policies governing
student participation, generates data that informs academic decisions, and supports lecturers in
monitoring engagement (Eweoya et al., 2025). Attendance is not merely a procedural formality;
research  has  consistently  demonstrated  a  positive  correlation  between  class  attendance  and
academic performance, making reliable attendance tracking a substantive institutional concern
(Lachake et al., 2023).

Traditional attendance management systems in universities have historically relied on manual
methods:  lecturers  call  out  names  during  roll  call,  students  sign  paper  registers,  or  class
representatives  collect  and  submit  handwritten  sheets  to  administrative  offices (Boateng,
2024). These approaches, while simple to implement, impose significant costs on institutions
of scale. According to Zhao et al. (2022), traditional paper-based methods are not only time-
consuming  but  also  unable  to  dynamically  monitor  students'  attendance  or  generate  data  for
real-time  analytics. At large universities, the  administrative burden of  collating, storing, and
retrieving  thousands  of  paper  attendance  sheets  each  semester  is  substantial,  and  the  risk  of
physical damage, loss, or deliberate alteration of paper records is ever-present (Korkortsi et al.,
## 2024).

Beyond administrative inefficiency, manual attendance systems are structurally vulnerable to
a  well-documented  form  of  academic  fraud:  proxy  attendance,  in  which  a  physically  absent
student arranges for a present colleague to sign their name or respond to roll call on their behalf
(Nwabuwe et  al., 2023).  Proxy attendance undermines the academic integrity of attendance-
based  policies  and  is  particularly  difficult  to  detect  without  technological  verification  of
physical presence. Babatunde et al. (2022) note that this form of fraud is especially prevalent
in  large  lecture  environments  where  lecturers  cannot  personally  verify  the  identity  of  every
student present. The need to automate attendance — and to do so in a way that is fraud-resistant,

## 6

accurate, and scalable — has driven extensive research into technological alternatives over the
past decade (Agripa and Astillero, 2022).

Automated  attendance  management  systems  have  taken  many  forms,  including  RFID-based
systems,  biometric  systems  using  fingerprint  and  facial  recognition,  Wi-Fi  and  Bluetooth
proximity  detection  systems,  and  smartphone-based  mobile  applications (Zhao  et  al.,  2022;
Rahaman,  2025).  Among  these,  mobile  application-based  systems  have  attracted  particular
interest  in  the  African  higher  education context  because  they  leverage  technology — the
student's  personal  smartphone — that  is  already  widely  owned,  thereby  avoiding  the  capital
expenditure associated with dedicated hardware infrastructure  (Korkortsi et al., 2024; Loglo,
2024). The proposed system for GCTU falls squarely within this category.

2.2.2 QR Code Attendance Systems
A  Quick  Response  (QR)  code  is  a  two-dimensional  matrix  barcode  originally  developed  by
Denso  Wave  in  Japan  in  1994  for  tracking  automotive  parts  (ISO/IEC  18004:2024).  Unlike
one-dimensional barcodes, QR codes can encode substantially more data — including URLs,
text strings, and structured data payloads — and can be decoded rapidly by any device equipped
with a camera and appropriate software (Nwabuwe et al., 2023). The adoption of QR codes in
educational  settings  accelerated  markedly  during  and  after  the  COVID-19  pandemic,  when
contactless  check-in  mechanisms  became  operationally  necessary  across  many  institutional
contexts (Mohammed and Zidan, 2023).

QR   code-based   attendance   systems   have   gained   significant   traction   across   academic
institutions  worldwide  due  to  their  efficiency,  accuracy,  and  contactless  nature (Agripa  and
Astillero,  2022;  Benesa  et  al.,  2024;  Mangca,  2023).  These  systems  typically  operate  by
generating  a  QR  code  at  the  beginning  of  a  lecture  session, either  displayed  on  a  projector
screen  or  printed  on  paper, which  students  scan  using  their  smartphones  to  register  their
attendance (Boateng,  2024).  The  scan  triggers  a  record  entry  in  a  backend  database,
timestamped  and  linked  to  the  student's  identity.  This  process  is  substantially  faster  than
manual roll call, reduces recording errors, and removes the need for paper entirely (Pujastuti
and Laksito, 2020).

## 7


Research has demonstrated that QR code attendance systems can reduce attendance marking
time  by  more  than  60%  compared  to  manual  methods  while  simultaneously  minimising
recording  errors  and  improving  transparency  in  reporting (Rosmala  et  al.,  2024).  The
integration of QR technology has been shown to improve monitoring accuracy and streamline
administrative workload across a wide range of institutional settings (Rosmala et al., 2024). In
the  Ghanaian  and  broader  African  context,  QR-based  systems  are  particularly  attractive
because  they  require  no  additional  hardware  beyond  the  student's  existing  smartphone, a
significant advantage in resource-constrained university environments (Korkortsi et al., 2024;
Krochinak et al., 2022).

Despite  these  advantages,  conventional  QR  code  attendance  systems  operating  with  static
codes  face  a  critical  and  well-documented  limitation:  the  QR  code  image  can  be  captured,
forwarded  through  messaging  applications,  and  scanned  by  students  who  are  not  physically
present  in  the  lecture  hall (Nwabuwe  et  al.,  2023;  Mohammed  and  Zidan,  2023).  This
vulnerability, which effectively replicates the proxy attendance problem of paper registers in a
digital form, has motivated researchers to explore more secure variants of QR-based attendance
systems, most notably the dynamic QR code approach discussed in Section 2.2.3 (Benesa et
al., 2024).

2.2.3 Dynamic QR Codes
A static QR code encodes a fixed payload that does not change after generation; once printed
or displayed, it remains identical indefinitely and can be scanned an unlimited number of times
by any device (International Organization for, 2024). A dynamic QR code, by contrast, contains
a short redirection URL or identifier that points to a server-side resource whose content can be
updated without altering the physical or displayed code (International Organization for, 2024).
In  the  context  of  attendance  systems,  the  term  'dynamic  QR  code'  is  used  specifically  to
describe  codes  whose  payload  changes  automatically  at  defined  time  intervals — typically
every 15 to 30 seconds — so that  any code  captured  and forwarded is invalid by the time a
remote user attempts to scan it (Nwabuwe et al., 2023).


## 8

The  security  advantage  of  time-expiring  dynamic  QR  codes  in  attendance  systems  is  well
established.  Mohammed  and  Zidan (2023) demonstrated  in  a  case  study  that  animated  and
time-expiring QR codes effectively neutralise the most common QR-sharing fraud scenario, as
the window between a code being displayed and expiring is too short for a student outside the
lecture  hall  to  intercept,  forward,  receive,  and  scan  it  in  time.  Nwabuwe  et  al. (2023)
corroborate this finding, reporting that their system, which regenerates QR codes every twenty
seconds, successfully mitigated all QR-sharing fraud attempts during controlled testing. Perin
(2025), in a systematic literature review using the PRISMA framework, confirmed that security
enhancements using randomised, animated, and dynamic QR codes integrated with geofencing
and IMEI validation effectively prevent fraudulent practices like proxy attendance and buddy
punching.

Beyond  anti-fraud  benefits,  dynamic  QR  codes  also  carry  session-specific  metadata  within
their payload. In the system proposed by Nwabuwe et al. (2023), for example, each generated
code  embeds  the  GPS  coordinates  of  the  geofenced  venue boundary,  enabling  the  student's
mobile application to validate location against the payload data rather than relying on a separate
server  call.  This  architectural  approach, encoding  geofence  parameters  directly  into  the  QR
payload, reduces  network  latency,  minimises  the  attack  surface,  and  ensures  that  every
attendance  scan  is  simultaneously  a  location  validation  event (Nwabuwe  et al.,  2023).  The
proposed GCTU system adopts this same design principle.

2.2.4 GPS Geofencing
The Global Positioning System (GPS) is a satellite-based radio navigation system maintained
by  the  United  States  Space  Force  that  provides  geolocation  data, latitude,  longitude,  and
altitude, to receivers anywhere on or near the Earth's surface (Eweoya et al., 2025). Modern
smartphones contain built-in GPS receivers capable of determining the device's coordinates to
an accuracy of approximately 3 to 5 metres under open-sky conditions, though accuracy may
degrade  in  indoor  environments  or  in  areas  of  dense  infrastructure (Babatunde  et  al.,  2022).
GPS  technology  forms  the  locational  backbone  of  the  geofencing  mechanism  central  to  the
proposed attendance system.


## 9

Geofencing  is  a location-based  service  technique  in  which  a  virtual  geographic  boundary, a
'geofence', is defined around a real-world area (Soko and Chatola, 2024). When a GPS-enabled
device enters, remains within, or exits the defined boundary, a corresponding event or action
is triggered (Eweoya et al., 2025). In the context of attendance management, geofencing is used
to validate that a student's device is physically within the defined boundary of a lecture hall or
classroom before the attendance record is confirmed (Babatunde et  al., 2022). The geofence
boundary is typically defined by a set of GPS coordinate pairs describing a polygon around the
target venue, and the system determines whether a student's device coordinates fall within that
polygon  using  a  geometric  algorithm  such  as  the  Ray  Casting  Algorithm  employed  by
Nwabuwe et al. (2023).

Research has demonstrated that GPS geofencing is an effective mechanism for reducing proxy
attendance and improving the accuracy of location-based attendance systems (Eweoya et al.,
2025;  Babatunde  et  al.,  2022).  Soko  and  Chatola (2024) found  that  a  geofencing-based
attendance   system   introduced   at   a   Central   African   university   significantly   improved
transparency  and  accuracy  compared  to  manual  methods,  and  both  faculty  and  students
reported  high  levels  of  satisfaction  with  the  system.  Babatunde  et  al. (2022),  working  in  a
Nigerian  university  context,  reported  that  their  geofencing  and  face  recognition  system
effectively solved the problems of intermediate and alternate attendance by requiring a student
to be both within the geofenced classroom area and biometrically verified before attendance
could be recorded.

Geofencing is not without challenges, however. GPS signal accuracy can be degraded inside
buildings  with  thick  concrete  walls,  which  may  cause  genuine  on-premises  students  to  be
recorded  as  outside  the  geofence  boundary, a  phenomenon  known  as  a  false  negative
(Babatunde et al., 2022). GPS spoofing, in which a device is configured to report false location
coordinates, represents a potential adversarial attack, although this requires a level of technical
sophistication  that  makes  it  unlikely  in  typical  university  settings (Nwabuwe  et  al.,  2023).
These limitations are mitigated in the proposed system by setting a generous but appropriate
geofence  radius  of  approximately  50  metres  around  each  lecture  hall,  and  by  combining
geofencing  with  the  dynamic  QR  code  layer  so  that  both  conditions  must  be  satisfied
simultaneously for attendance to be recorded.

## 10


2.2.5 Blockchain Technology in Attendance and Security
Blockchain technology is a form of distributed ledger technology in which data is stored in a
sequential,  cryptographically  linked  chain  of  blocks  across  a  network  of  participating  nodes
(Wang,  2023).  Each  block  in  the  chain  contains  a  set  of  records,  a  timestamp,  and  a
cryptographic  hash  of  the  preceding  block;  this  chaining  means  that  altering  any  historical
block  would  require  recalculating  the  hashes  of  all  subsequent  blocks,  a  computationally
infeasible task on any sufficiently distributed network (Sharples and Domingue, 2016), as cited
in Blockchain Technology in Higher Education Ecosystem (IntechOpen, 2023). The result is a
data structure that is, in practice, immutable: records once written to the blockchain cannot be
altered or deleted without detection (IntechOpen, 2023).

These   properties, immutability,   decentralisation, and   cryptographic   verifiability, make
blockchain technology a compelling candidate for applications requiring trustworthy record-
keeping  in  the  absence  of  a  single  trusted  central  authority (Wang,  2023).  In  the  higher
education context, blockchain has been explored most extensively for credential verification:
universities including MIT and the University of Utah have piloted blockchain-based certificate
issuance systems that allow employers to verify a graduate's qualifications without contacting
the  issuing  institution (Parashar,  2024).  Alam  (2020,  as  cited  in (Parashar,  2024))  describes
blockchain as a decentralised, immutable ledger where student information is stored securely
and  remains  tamper-proof,  with  smart  contracts  enabling  the automation  of  student  record
transactions and thereby reducing the risks of fraud, human error, and inefficiency.

In  the  specific  context  of  attendance  management,  Wang (2023) argues  that  the  centralised
databases used by most existing systems are fundamentally ill-suited to the trust requirements
of formal academic records, because any actor with administrative access to the database can
modify  records  without  leaving  a  detectable  trace.  Wang (2023) further  notes  that  when
educational data are stored on a blockchain, they are encrypted using asymmetric encryption
algorithms and stamped with a digital signature that prevents tampering, verifies the source,
and creates a transparent and auditable record. The decentralised nature of blockchain storage
means that no single institution, administrator, or malicious actor can unilaterally alter or delete
a confirmed attendance entry (Wang, 2023).

## 11


Despite  these  advantages,  blockchain  technology  presents  implementation  challenges  that
researchers  have  consistently  noted.  Blockchain  networks,  particularly  public  chains,  may
introduce latency in high-throughput applications, as consensus mechanisms require network-
wide agreement before a block is confirmed (Tahora et al., 2023). Storage limitations, typically
around 1 MB per block, mean that only small data records, such as attendance confirmation
entries, are suitable for on-chain storage, while larger associated files must be stored off-chain
with their  hash  recorded  on-chain  to  preserve  verifiability (Eren  et  al.,  2025).  The  proposed
GCTU system addresses these limitations by storing only the attendance confirmation hash and
metadata on-chain, ensuring fast write times while preserving the immutability guarantee that
distinguishes the proposed system from all four reviewed systems.

2.3 Review of Existing Systems
The  following  sub-sections  review  four  peer-reviewed  systems  published  between  2022  and
2025  that  are  directly  relevant  to  the  proposed  GCTU  attendance  system.  Two  systems  are
drawn from the Ghanaian and West African context and two from the international literature.
Each  system  is  examined  as  a  flowing  academic  narrative  that  covers  its  background  and
context,  the  technologies employed,  its  contributions  and  strengths,  its  limitations  and
weaknesses, and its relevance to the proposed study.

2.3.1 Design and Implementation of a Student Attendance Management
System with QR Code (Boateng, 2024)
Enimil Kweku Boateng published this study in 2024, drawing on work conducted at a Ghanaian
educational institution in Ho, in the Volta Region. The study was motivated by precisely the
same  institutional  pressures  confronting  GCTU:  the  challenge  of  managing  attendance  in  a
growing   educational   environment   where   manual,   paper-based   systems   had   become
administratively burdensome, error-prone, and inadequate for the scale of modern university
operations (Boateng, 2024). Boateng situates his work within the well-established argument,
echoed  across  the  Ghanaian  educational  technology  literature,  that  traditional  attendance
registers   are   susceptible   to   human   error,   deliberate   manipulation,   and   administrative

## 12

inefficiency, observations  also  corroborated  by  Korkortsi  et  al. (2024) and by  the  broader
African literature on educational technology adoption (Loglo, 2024).

The  system  Boateng  developed  centres  on  a  static  QR  code  tied  uniquely  to  each  registered
student. Students present their individual QR code at the beginning of a session; a lecturer or
designated scanner reads the code using a mobile device, and the system records a timestamped
attendance entry in a relational database backend. The frontend provides lecturers with a web-
based  interface  for  initiating  sessions,  reviewing  attendance,  and  generating  end-of-session
reports (Boateng,  2024).  Prototype  testing  confirmed  improved  accuracy  compared  to  the
paper-based  baseline,  reduced  the  time  required  to  mark  a  session,  and  produced  digitally
searchable records that could be retrieved instantly rather than requiring physical file access.
The system's web-based dashboard also provides the kind of real-time administrative visibility
that paper systems cannot offer, and the study's locally grounded implementation demonstrates
the practical feasibility of QR-based attendance in Ghanaian institutional settings, a valuable
contribution to the local literature (Boateng, 2024).

However, the system's most significant limitation lies in its use of static QR codes. Because
each student's code is fixed and permanent, it can be photographed, forwarded via WhatsApp
or other messaging platforms, and scanned by a proxy on behalf of an absent student. Boateng
(2024) explicitly acknowledges this vulnerability and identifies it as a direction for future work.
Compounding  this,  the  system  incorporates  no  GPS-based  location  validation:  there  is  no
mechanism  to  verify  that  the  device  scanning  the  code  is  physically  within  the  lecture  hall,
meaning a student could scan their code from a corridor, a neighbouring building, or even off-
campus if they had pre-shared the image. Attendance records are also stored in a centralised
relational database with no immutability layer, meaning that authorised or unauthorised actors
with database access could modify records after submission without any detectable audit trail
(Wang, 2023). Taken together, these limitations static codes, absent geofencing, and mutable
storage directly motivate three of the four architectural layers of the proposed GCTU system,
making Boateng's (2024)  study both a relevant baseline and a clear indicator of what remains
to be addressed.


## 13

2.3.2 Design and Implementation of a Mobile-Based Attendance Register (Korkortsi,
Okyere, and Ahenkorah-Marfo, 2024)
Wisdom Elikplim Korkortsi, Joseph Ayisi Okyere, and Michael Ahenkorah-Marfo published
this  study  in  September  2024  through  MDPI's  Preprints.org,  representing  one  of  the  most
contextually relevant contributions to the present review. The research was conducted within a
Ghanaian  university  environment  and  explicitly  addresses  the  challenges  posed  by  what  the
authors  describe  as  a  fast-growing  university  community, precisely  the  institutional  context
that  GCTU  exemplifies  with  its  growth  from  350  students  in  2006  to  approximately  16,000
students  across  eight  campuses  by  2024 (Korkortsi  et  al.,  2024;  Directorate  of  University,
2025).  The  study  was  motivated  by  the  limitations  of  earlier  Ghanaian  attendance  systems,
which  the  authors  identify  as  narrowly  platform-specific  and  insufficiently  scalable  for  the
demands of modern university administration.

The system was developed using Flutter, Google's open-source, cross-platform SDK, enabling
a  single  codebase  to  function  natively  on  both  Android  and  iOS  devices — a  meaningful
advance  over  many  earlier  Ghanaian  systems  built  exclusively  for  Android,  which  excluded
the growing number of students using iOS devices (Korkortsi et al., 2024). Firebase served as
both  the authentication  provider  and  the  cloud-based  real-time  database  backend.  The  Bring
Your Own Device (BYOD) architecture means students use their own smartphones to prove
their presence for class sessions, eliminating any need for institution-provided hardware and
addressing  the  cost  barrier  that  Loglo (2024) identifies  as  a  primary  impediment  to  digital
transformation  in  Ghanaian  higher  education.  Firebase's  real-time  database  synchronisation
ensures that attendance entries are immediately visible to lecturers through the web dashboard,
and the system achieved high model accuracy during prototype testing (Korkortsi et al., 2024).

Despite these contributions, Korkortsi et al.'s (2024) system leaves three critical vulnerabilities
unresolved.  First,  the  system  incorporates  no  GPS-based  geofencing:  a  student  can  register
attendance  from  any  location  with  internet  access  and  valid  credentials,  with  no  structural
mechanism  preventing  registration  from  a  dormitory,  a  café,  or  any  off-campus location.
Second, the BYOD architecture, while cost-effective, increases the risk of credential sharing:
a  student  can  provide  their  login  details  to  a  present  colleague  and  have  them  register
attendance remotely, a form of proxy fraud that the system does not technically prevent. Third,

## 14

Firebase's cloud database is a centralised, mutable storage system; as Wang (2023) observes,
centralised architectures introduce a single point of failure for data integrity, and any actor with
Firebase  administrative  access  could  modify  or  delete  attendance  records  without  leaving  a
verifiable audit trail. These limitations establish a clear trajectory from Korkortsi et al.'s (2024)
work toward the proposed GCTU system, which adds the missing geofencing, dynamic session
authentication, and blockchain integrity layers that the Ghanaian literature has yet to combine
within a single architecture.

2.3.3 Fraud Mitigation in Attendance Monitoring Systems Using Dynamic QR Code,
Geofencing and IMEI Technologies (Nwabuwe, Sanghera, Alade, and Olajide, 2023)
Augustine Nwabuwe, Baljinder Sanghera, Temitope Alade, and Funminiyi Olajide published
this  study  in  the  International  Journal  of  Advanced  Computer  Science  and  Applications  in
2023, working from the Department of Computer Science at Nottingham Trent University in
the  United  Kingdom.  The  study  begins  from  the  observation  that  single-layer  security
approaches, systems relying on QR codes alone, location alone, or credentials alone, are each
individually  bypassable  through  well-known  attack  strategies,  and  that  truly  fraud-resistant
attendance  management  requires  the  simultaneous  layering  of  multiple  complementary
mechanisms (Nwabuwe et al., 2023). This foundational argument places their work among the
most  technically  rigorous  in  the  attendance  management  literature  and  makes  it  the  closest
existing precursor to the system proposed for GCTU.

The  system  comprises  two  components:  a  cross-platform  mobile  application  for  student
registration  and  QR  scanning,  and  a  Single  Page  Application  (SPA)  for  administrative
management. The mobile application registers the user's device IMEI at first launch, collects
GPS coordinates during a session, and scans the dynamic QR code displayed by the instructor.
The SPA enables administrators to generate time-expiring QR codes, define geofenced venue
boundaries  using  the  Google  Maps  API,  and  review  attendance  analytics (Nwabuwe  et  al.,
2023). The entire backend was developed on the MERN stack, MySQL, ExpressJS, ReactJS,
and NodeJS. Critically, the QR code regenerates  automatically every twenty seconds and its
payload include the polygon GPS coordinates of the venue's geofence; a modified Ray Casting
Algorithm then determines whether the student's  GPS coordinates fall within the polygon at
the  moment  of  scanning (Nwabuwe  et  al.,  2023).  This  architecture  means  that  a  successful

## 15

attendance  scan  is simultaneously  a  time-validated,  location-validated,  and  device-validated
event, a design principle the proposed GCTU system directly inherits.

Experimental  testing  across  three  fraud  scenarios, geofence  evasion,  QR  code  sharing,  and
IMEI bypassing, confirmed that all three attack vectors were successfully mitigated, making
Nwabuwe  et  al.'s  (2023) system  the  most  comprehensively  fraud-resistant  in  the  reviewed
literature.  Nevertheless,  the  system's  most  significant  gap  is  the  complete  absence  of  any
tamper-proof  data  storage  layer.  All  confirmed  attendance  records  are  written  to  a  MySQL
relational database, a centralised, mutable system that remains vulnerable to post-submission
alteration by privileged administrators or successful attackers (Wang, 2023). In an institutional
setting where attendance data carries formal academic and legal consequences, as at GCTU,
where  a  student  absent  for  ten  or  more  days  may  be  barred  from  semester  examinations
(Kaguah  and  Kooning,  2023) the  inability  to  guarantee  the  integrity  of  stored  records  after
submission   represents   a   significant   institutional   risk.   Additionally,   the   IMEI   binding
mechanism  requires  administrative  intervention  when  a  student  changes  devices,  and  the
system  does  not address  GPS  spoofing  as  a  potential  future  attack  vector (Nwabuwe  et  al.,
2023). The single gap between their system and the one proposed in this project the absence of
blockchain-backed immutable storage, is precisely the gap that the proposed GCTU system's
fourth architectural layer is designed to close.

2.3.4 Design and Implementation of a University Attendance Management System
Using Geo-Fencing (Eweoya et al., 2025)
Ibukun  O.  Eweoya  and  colleagues  from  Babcock  University,  Nigeria,  in  collaboration  with
Yaw Asa Mensah of Valley View University, Ghana, published this study in the Asian Journal
of  Computer  Science  and  Technology in  early  2025.  The  study  was  conducted  at  Babcock
University  in  Ogun  State,  Nigeria,  and  its  motivating  problem, a  growing  university  whose
paper-based   attendance   management   had   become   inefficient,   inaccurate,   and   prone   to
manipulation, mirrors the GCTU situation almost precisely (Eweoya et al., 2025). The authors
employed a mixed-methods research design, gathering qualitative data through interviews with
students  and  lecturers  to  identify  the  specific  deficiencies  of  the  existing  system  before
proceeding to system design and prototype implementation. The involvement of a Valley View

## 16

University  co-author  from  Ghana  lends  particular  contextual  weight  to  this  study's  findings
within the West African higher education landscape.

The  system  is  a  web-based  application  with  cross-platform  mobile  compatibility,  developed
using Python for backend logic and JavaScript for the frontend, with SQLite as the lightweight
relational database engine. The geofencing mechanism captures a student's GPS coordinates
when they attempt to register attendance and checks whether those coordinates fall within the
polygon boundary defined for their lecture hall (Eweoya et al., 2025). Lecturers are provided
with a web dashboard for creating and managing geofenced zones, monitoring attendance in
real  time,  and  generating  compliance  and  exception  reports.  Post-deployment  user  feedback
from both students and lecturers was positive, with both groups rating the system as intuitive,
reliable, and more efficient than the paper-based approach it replaced (Eweoya et al., 2025).
The authors explicitly position their system as a scalable model for other African universities
facing  similar  administrative  challenges,  a  positioning  that  makes  their  findings  directly
applicable to GCTU's institutional context.

Despite these contributions, the system carries two critical limitations that are consistent with
the broader gaps identified across the reviewed literature. First, the system has no dynamic QR
code or  equivalent session-authentication mechanism; attendance is validated solely through
GPS  location  detection.  This  means  that  a  student  who  is  physically  within  the  geofenced
boundary can register on behalf of an absent colleague simply by using that colleague's login
credentials,  as  there  is  no  session-specific  token  or  time-expiring  code  to  prevent  credential
sharing (Eweoya  et al., 2025). Second,  all attendance data is stored in SQLite — a standard
file-based relational database that offers no cryptographic audit trail and whose records can be
modified by any actor with file system access, a vulnerability that Wang (2023) identifies as
an inherent weakness of centralised storage for formal academic records. Neither limitation is
acknowledged  as  a  direction  for  future  work  in  the  published  study.  Taken  alongside  the
findings of the three systems reviewed above, Eweoya et al.'s (2025) work reinforces the same
conclusion: geofencing alone is a necessary but not sufficient condition for a fully secure and
trustworthy  attendance  system,  and  the  addition  of  dynamic  session  authentication  and
blockchain-backed  data  integrity  is  what  the  proposed  GCTU  system  uniquely  brings  to  the
landscape.

## 17


2.4 Comparative Analysis of Existing Systems

Table  2.1  below  presents  a  structured  comparison  of  the  four  reviewed  systems  against  the
proposed  Smart  Attendance  System  for  GCTU  across  eight  key  features.  The  comparison
reveals  a  clear  progression  of  capability  across  the  reviewed  works  but  also  exposes  the
persistent gap, the simultaneous combination of dynamic QR authentication, GPS geofencing,
and blockchain data integrity, that no single existing system has addressed.

Table 2.1: Comparative Analysis of Existing Attendance Systems and the Proposed System

## Feature Boateng
## (2024)
Korkortsi et al.
## (2024)
Nwabuwe et al.
## (2023)
Eweoya et al.
## (2025)
## Proposed
## System
Dynamic QR Code
## ✘ ✘ ✔ ✘ ✔
GPS Geofencing
## ✘ ✘ ✔ ✔ ✔
## Blockchain
## Storage
## ✘ ✘ ✘ ✘ ✔
## Device Binding
## (IMEI)
## ✘ ✘ ✔ ✘ ✔
Cross-Platform
## Mobile
## ✔ ✔ ✔ ✔ ✔
Real-Time
## Dashboard
## ✔ ✔ ✔ ✔ ✔
## Proxy Fraud
## Prevention
## Low Low High Moderate High
## Data Integrity
## Guarantee
## None None None None Blockchain
Ghana/West
## Africa Context
## ✔ ✔ ✘ ✔ ✔


## 18

As Table 2.1 illustrates, the proposed system is the only one among the five that simultaneously
integrates dynamic QR codes, GPS geofencing, blockchain-based storage, and device binding.
Boateng (2024) and Korkortsi et al. (2024) — the two Ghanaian systems — provide neither
dynamic  QR  codes  nor  geofencing,  and  neither  addresses  data  integrity  beyond  standard
relational  database  security.  Eweoya  et  al. (2025) provide  geofencing  but  lack  session
authentication and immutable storage. Only Nwabuwe et al. (2023) achieve the combination
of  dynamic  QR  and  geofencing,  but  they  stop  short  of  blockchain-backed  integrity.  The
proposed system closes this final gap, making it the first system in the reviewed literature to
combine all four layers within a single architecture tailored for a Ghanaian university context.

## 2.5 Identified Research Gaps
The review of existing literature and systems presented in Sections 2.2 and 2.3 reveals a set of
persistent research gaps that recur systematically across the body of reviewed work. These are
not isolated shortcomings of individual studies; they represent fundamental limitations in the
current state of the art that collectively justify the design and scope of the proposed system.

The  first  and  most  pervasive  gap  is  the  continued  reliance  on  static  QR  codes  in  systems
developed for the Ghanaian and West African context. Both Boateng (2024) and Korkortsi et
al.  (2024)  employ  static  or  session-independent  authentication  mechanisms  that  can  be
photographed, forwarded, and scanned by students who are not physically present at the time
of the session. As established in Section 2.2.2 and confirmed by Mohammed and Zidan (2023)
and  Nwabuwe  et  al.  (2023),  static  QR  codes  are  structurally  vulnerable  to  forwarding  and
remote scanning. This gap is particularly significant in the Ghanaian university context, where
the ubiquity of WhatsApp and other messaging platforms makes it trivially easy for a student
to forward a captured QR code image to an absent colleague within seconds of it appearing on
a projector screen. No Ghanaian study published between 2022 and 2025 has implemented a
dynamic, time-expiring QR code mechanism that structurally eliminates this attack vector.

The  second  gap  is  incomplete  or  entirely  absent  geolocation  enforcement.  Two  of  the  four
reviewed  systems, Boateng  (2024)  and  Korkortsi  et  al.  (2024), incorporate  no  GPS-based
location validation whatsoever, meaning that attendance can be registered from any location

## 19

with internet access and valid credentials. While Eweoya et al. (2025) implement geofencing,
their system does so without a complementary session-authentication layer, leaving the system
vulnerable  to  within-geofence  credential  sharing  where  one  student  registers  on  behalf  of
another  from  inside  the  lecture  hall  boundary.  Only  Nwabuwe  et  al.  (2023)  achieve  robust
location  enforcement  by  embedding  geofence  parameters  directly  into  the  QR  payload, but
their  system  was  not  developed  for  the  Ghanaian  context  and,  critically,  still  lacks  a  data
integrity mechanism. The result is that location verification, the most direct technical proof of
physical attendance, remains absent or incomplete across the entire reviewed body of Ghanaian
literature.

The third gap, and perhaps the most consequential in terms of institutional trust, is the universal
absence of immutable, blockchain-backed data storage across all four reviewed systems. Every
system  examined  in  this  chapter  Boateng  (2024),  Korkortsi  et  al.  (2024),  Nwabuwe  et  al.
(2023),  and  Eweoya  et  al.  (2025) , stores  attendance  data  in  centralised  relational  or  cloud
databases, specifically MySQL, Firebase, and SQLite, all of which are mutable by definition.
Wang (2023) identifies this as a systemic gap across educational technology systems generally,
arguing  that  centralised  databases  cannot  meet  the  trust  requirements  of  formal  academic
records. For an institution like GCTU, where attendance data directly determines examination
eligibility under the student handbook (Kaguah & Kooning, 2023), the inability to guarantee
that  a  stored  record  has  not  been  altered  after  submission  represents  an  unacceptable
institutional  risk.  This  gap  remains  unaddressed  in  the  entire  body  of  literature  reviewed,
making it the most novel contribution of the proposed system.

The fourth gap flows directly from the third: proxy attendance, which every reviewed system
identifies  as  the  primary  threat  to  attendance  integrity,  is  only  partially  addressed  by  the
existing  solutions.  Static  QR  codes  prevent  only  the  simplest  forms  of  remote  proxy  fraud.
Geofencing  without  session  authentication  prevents  off-campus  proxy  attendance  but  not
within-boundary credential sharing. Only Nwabuwe et al. (2023) achieve comprehensive proxy
prevention  through  the  combination  of  dynamic  QR  codes,  geofencing,  and  IMEI  device
binding — but even their system has not been adapted for the Ghanaian context, and their IMEI
binding mechanism introduces usability challenges when students change devices. A system

## 20

that addresses all proxy attack vectors simultaneously, within a Ghanaian institutional context,
does not yet exist in the literature.

The  fifth  and  final  gap  concerns  the  limited  applicability  of  existing  systems  to  the  specific
scale  and  multi-campus  complexity  of  GCTU.  None  of  the  reviewed  systems  was  designed
with an institution of sixteen thousand students spread across eight campuses in mind. Boateng
(2024)  developed  his  system  for  a  single  school;  Korkortsi  et  al.  (2024),  while  targeting
Ghanaian  universities,  did  not  address  institutions  of  GCTU's  size  or  geographic  spread;
Eweoya  et  al.'s  (2025)  system,  though  the  most  scale-aware,  was  implemented  at  a  single-
campus  Nigerian  institution;  and  Nwabuwe  et  al.'s  (2023)  system  was  developed  in  a  UK
university context with a fundamentally different infrastructure environment. Together, these
five gaps, static QR codes, incomplete geolocation enforcement, absent blockchain integrity,
partial proxy prevention, and limited scalability for large multi-campus institutions, establish a
clear  and  compelling  rationale  for  the  proposed  system,  which  is  designed  to  close  all  five
simultaneously within a single, coherent architecture tailored for GCTU.

2.6 Summary of the Literature Review
This  chapter  has  reviewed  the  conceptual  foundations  and  existing  systems  relevant  to  the
proposed  Smart  Attendance  System  for  GCTU.  Section  2.2  established  the  theoretical  and
technical background of attendance management systems, QR code technology, dynamic QR
codes,  GPS  geofencing,  and  blockchain-based  data  integrity  the  five  pillars  on  which  the
proposed system is built. Section 2.3 examined four peer-reviewed systems published between
2022 and 2025, two from the Ghanaian and West African context (Boateng, 2024; Korkortsi et
al., 2024) and two from the international literature (Nwabuwe et al., 2023; Eweoya et al., 2025),
each  reviewed  as  a  flowing  academic  narrative  covering  context,  technologies,  strengths,
weaknesses, and relevance.

The  comparative  analysis  in  Section  2.4 demonstrated  that  while  the  reviewed  systems
collectively represent meaningful progress over paper-based attendance management, no single
system  has  resolved  all  four  critical  limitations  simultaneously:  static  or  absent  QR  session
authentication,  incomplete  geolocation  enforcement,  mutable  centralised  data  storage,  and

## 21

weak  proxy-prevention  mechanisms.  Section  2.5  formalised  these  observations  as  five
identified research gaps, each directly addressed by the proposed system's architecture.

The  literature review  thus  provides  both  a  rigorous  justification  for  the  proposed  system's
design  and  a  clear  positioning  of  its  contribution  relative  to  the  existing  state  of  the  art.  By
combining  dynamic  QR  codes,  GPS  geofencing,  and  blockchain-backed  immutable  storage
within a single Flutter-based mobile application designed for GCTU's scale and institutional
context, the proposed system represents the next  evolutionary step in the  trajectory of smart
attendance  systems  for  Ghanaian  higher  education  institutions — a  step that,  as  this  chapter
has demonstrated, the existing literature has not yet taken.






















## 22

## 1.6 References


AFOAKWA, E. O. 2021. Examination Guidelines for Faculty Staff – First Semester 2021/2022. Accra:
## GCTU.
AGRIPA, D. J. B. & ASTILLERO, S. F. 2022. Development of Employee Attendance and Management
System Using Quick Response (QR) Code in Sorsogon State University, Castilla Campus,
Philippines. European Journal of Education Studies.
BABATUNDE, A. O., BABATUNDE, R. S. & OKE, A. 2022. Mobile Based Student Attendance System
Using Geo-Fencing With Timing and Face Recognition. International Journal of Advanced
Computer Science and Applications, 10.
BENESA, J., TUBICE, A. & TUBICE, R. 2024. Enhancing Attendance Tracking Efficiency and
Effectiveness through the Implementation of a QR Code-Based System. International Journal
of Research and Innovation in Social Science.
## BOATENG, E. 2024. DESIGN AND IMPLEMENTATION OF STUDENT ATTENDANCE MANAGEMENT
## SYSTEM WITH QR CODE.
CRESWELL, J. W. & CRESWELL, J. D. 2023. Research Design: Qualitative, Quantitative, and Mixed
Methods Approaches, Thousand Oaks, CA, SAGE Publications.
DIRECTORATE OF UNIVERSITY, R. 2025. GCTU Makes History Matriculating 5,128 Fresh Students for
2024/2025 Academic Year. Accra, Ghana: Ghana Communication Technology University.
DIRECTORATE OF UNIVERSITY RELATIONS 2025. GCTU Makes History Matriculating 5,128 Fresh
## Students For 2024/2025 Academic Year.
DIRECTORATE OF UNIVERSITY RELATIONS 2026. VC Declares 2026 The Year to Scale Up, Not Slow
## Down.
EREN, H., KARADUMAN, Ö. & GENÇOĞLU, M. T. 2025. Security Challenges and Performance Trade-
Offs in On-Chain and Off-Chain Blockchain Storage: A Comprehensive Review. Applied
## Sciences, 15, 3225.
EWEOYA, I. O., ADENIYI, O. J., AWONIYI, A. O., MGBEAHURUIKE, E., ADEWUYI, J. O., ADIGUN, T. O. &
MENSAH, Y. A. 2025. Design and Implementation of a University Attendance Management
System Using Geo-Fencing. Asian Journal of Computer Science and Technology, 14, 28–46.
INTECHOPEN 2023. Blockchain in Higher Education: A Secure Traceability Architecture for Degree
Verification. IntechOpen. IntechOpen.
INTERNATIONAL ORGANIZATION FOR, S. 2024. Information Technology – Automatic Identification
and Data Capture Techniques – QR Code Bar Code Symbology Specification. ISO/IEC
18004:2024. Geneva, Switzerland: International Organization for Standardization.
KAGUAH, C. & KOONING, C. 2022. Ghana Communication Technology University Strategic Plan 2022-
- Accra: GCTU.
KAGUAH, C. & KOONING, C. 2023. Undergraduate Student's Handbook, Accra, Ghana
## Communication Technology University.
KORKORTSI, W. E., OKYERE, J. A. & AHENKORAH-MARFO, M. 2024. Design and Implementation of a
## Mobile Based Attendance Register. Preprints. Preprints.
KROCHINAK, S., CUI, S., AJAYI, B., EGONU, R. & KIM, E. 2022. A Mixed-Methods Study of Secondary
Student and Teacher Attitudes Towards Mobile Education Apps in Lagos. Journal of
Education Society and Behavioural Science, 72–83.
LACHAKE, C., SAPRE, T., INGLE, T., GADEKAR, S. & GHULE, A. 2023. Review on Online Student
Attendance System. International Journal for Research in Applied Science and Engineering
Technology (IJRASET).
LOGLO, F. S. 2024. Towards Digital Transformation of Selected Ghanaian Public Universities:
Leadership Enablers, Challenges, and Opportunities. Open Praxis, 16, 374–395.

## 23

MANGCA, D. C. 2023. Enhanced Attendance Monitoring: Utilizing QR Code for Online Attendance
with Laravel Framework and SMS Notification. International Journal of Advanced Research in
Science, Communication and Technology.
MOHAMMED, M. S. & ZIDAN, K. A. 2023. Enhancing Attendance Tracking Using Animated QR Codes:
A Case Study. Indonesian Journal of Electrical Engineering and Computer Science, 31, 1716–
## 1723.
NWABUWE, A., SANGHERA, B., ALADE, T. & OLAJIDE, F. 2023. Fraud Mitigation in Attendance
Monitoring Systems using Dynamic QR Code, Geofencing and IMEI Technologies.
International Journal of Advanced Computer Science and Applications, 14, 938–945.
PARASHAR, A. 2024. Blockchain in Higher Education: MIT and University of Utah Case Studies.
## Malque Publishing.
PARLIAMENT OF GHANA 2020. Ghana Communication Technology University Act, 2020 (Act 1022),
Government of Ghana.
PERIN, M. A. D. QR Code-Based Attendance Systems in Education: A Systematic Literature Review on
Data Accuracy and Sustainable School Management.  Proceedings of The International
Conference on Computer Science, Engineering, Social Science, and Multi-Disciplinary
## Studies, 2025. 80–87.
PUJASTUTI, E. & LAKSITO, A. D. 2020. QR Code-Based Student Attendance Monitoring System.
Telematika: Jurnal Informatika dan Teknologi Informasi, 17, 1–8.
## RAHAMAN, M. I., M.
NANDI, D. 2025. SmartPresence: Wi-Fi-Based Online Attendance Management for Smart Academic
Assistance. Journal of Electrical Systems and Information Technology.
ROSMALA, D., ICHWAN, M., DARMAWAN, D., FAUZAN, F., YUDISTIRA, A. & ANWAR, M. 2024. Sistem
e-presensi berbasis web dengan kode QR di SMK Negeri 2 Cimahi. Dinamika Sosial: Jurnal
Pengabdian Masyarakat dan Transformasi Kesejahteraan.
SHARPLES, M. & DOMINGUE, J. 2016. The Blockchain and Kudos: A Distributed System for
Educational Record, Reputation and Reward. In: VERBERT, K., SHARPLES, M. & KLOBUČAR, T.
(eds.) Adaptive and Adaptable Learning: Proceedings of EC-TEL 2016. Springer, Cham.
SOKO, H. & CHATOLA, F. 2024. Attendance Tracking System Using Geofencing. i-Manager's Journal
on Information Technology, 13, 22–27.
TAHORA, S., SAHA, B., SAKIB, N., SHAHRIAR, H. & HADDAD, H. 2023. Blockchain Technology in Higher
Education Ecosystem. arXiv.
THE, B. & FINANCIAL, T. 2025. Ghana Communication Technology University (GCTU) – A trailblazer in
technology-driven higher education.
WANG, Q. 2023. Blockchain for Credibility in Educational Development: Key Technology, Application
Potential, and Performance Evaluation. Security and Communication Networks, 2023,
## 5614241.
ZHAO, M., ZHAO, G. & QU, M. 2022. College Smart Classroom Attendance Management System
Based on Internet of Things. Computational Intelligence and Neuroscience, 2022, 4953721.

# 🏛️ OmniSports Platform — Technical System Architecture & Developer Manual

This document outlines the system architecture, event pipelines, networking protocols, security mechanisms, and codebase integrations for the **OmniSports Real-time Tournament Management Platform**.

---

## 🛠️ Technology Stack & Dependencies

```
     +-------------------------------------------------------------+
     |                       CLIENT SIDE (SPA)                     |
     |  React 18  +  Vite  +  Tailwind CSS  +  Lucide  +  Motion/React |
     +------------------------------+------------------------------+
                                    |
                                    | Server-Sent Events (SSE) & REST HTTP
                                    v
     +-------------------------------------------------------------+
     |                      JAVA ENTERPRISE API                    |
     |         Spring Boot  +  Spring Security  +  Spring Kafka    |
     +------------------------------+------------------------------+
                                    |
                                    | Apache Kafka Protocol (9092)
                                    v
     +-------------------------------------------------------------+
     |                    EVENT STREAMING BROKER                   |
     |                         Apache Kafka                        |
     +-------------------------------------------------------------+
```

### Backend (Spring Boot Framework)
*   **Java SE 11+** with Spring Boot Starter Web.
*   **Spring Security**: JWT-based stateless request authorization. Includes query-string fallback mapping for native browser implementations.
*   **Spring Kafka**: Fully-integrated producer and consumer capabilities interfacing with the Kafka Cluster.
*   **Apache Kafka Broker**: Log-based distributed event stream engine.

### Frontend (User Interface Engine)
*   **React 18 (TypeScript)**: Single-page application rendering, functional components, reactive context hooks.
*   **Vite**: Next-generation development runtime (port `3000`).
*   **Tailwind CSS**: Utility-first styling framework.
*   **HTML5 EventSource API**: Native browser SSE connection handler.

---

## 📐 System Architecture

Specifically, the platform features a reactive, event-driven decoupled architecture. Commands are issued via REST headers, processed inside service layers, published to our distributed Kafka cluster, consumed, and instantly broadcast to all open web-socket/SSE clients.

Below is the complete architectural data-flow rendering:

```
[ FRONTEND DECK ]
   │
   │  1. HTTP POST /api/events   (Create Tournament)
   │  OR PUT /api/events/match   (Register Live Scores)
   ▼
[ SPRING CONTROLLERS ] ──▶ [ TOURNAMENT SERVICE ]
   │
   │  2. Triggers Event Recording 
   ▼
[ KAFKA PRODUCER SERVICE ]
   │
   │  3. Publishes TournamentKafkaEvent (JSON)
   ▼
┌────────────────────────────────┬───────────────────────────────┐
│                    APACHE KAFKA CLUSTER                        │
│                                                                │
│  Topic: "tournament-events"                                    │
│  [ Partition 0 ]      [ Partition 1 ]      [ Partition 2 ]     │
│  (Indexed by eventId to preserve sequence on sequential keys)  │
└────────────────────────────────┬───────────────────────────────┘
                                 │
                                 │ 4. Receives message asynchronously
                                 ▼
                    [ KAFKA CONSUMER SERVICE ]
                                 │
                                 │ 5. Validates schema format 
                                 ▼
                       [ SSE BROADCASTER ]
                                 │
                                 │ 6. Dispatches to active client SSE loops
                                 ▼
                     *───────────────────────*
                     │  Active SSE Client 1  │ (React Toaster displays card)
                     │  Active SSE Client 2  │ 
                     │  Active SSE Client ...│ 
                     *───────────────────────*
```

### Detailed Component Roles:

1.  **Ingress Controllers (`EventController.java`)**:
    Provides HTTP endpoints for managing resources (e.g. creating sport events or registering match results). All calls undergo JWT authentication checks.
2.  **Tournament Service (`TournamentService.java`)**:
    Handles baseline CRUD and validation logic.
3.  **Distributed Stream Producer (`KafkaProducerService.java`)**:
    Constructs a unified, wrapped `TournamentKafkaEvent` carrier containing the action metadata, timestamps, and serialized pay-load payloads. Publishes it to the target Apache Kafka topic.
4.  **Apache Kafka Message Broker**:
    Maintains a durable distributed log. The topic `tournament-events` is configured with **3 Partitions** and dynamic keys matching the `eventId` to guarantee ordered message execution on any single tournament stream.
5.  **Analytics Event Consumer (`KafkaConsumerService.java`)**:
    Subscribes to the `tournament-events` topic using a unique consumer group (`omnisports-analytics-group`). Validates incoming packets before feeding them straight into the Server-Sent Events engine.
6.  **Server-Sent Events Core (`SseService.java` & `SseController.java`)**:
    Maintains thread-safe subscriptions of dynamic browser nodes (`CopyOnWriteArrayList` emitters). When a Kafka consumer parses a message, it is broadcast instantly across all registered connections via persistent HTTP channels.

---

## 🗄️ Event Payload Structures (Kafka Serialization Schema)

All event notifications traveling through Apache Kafka topics conform to the following JSON structure:

```json
{
  "eventType": "MATCH_RESULT_RECORDED",
  "timestamp": "2026-06-01T13:15:00",
  "eventId": "evt-77291",
  "description": "Match result recorded (Completed): United Academy [3] vs [1] City FC",
  "payload": {
    "matchId": "m-202",
    "eventId": "evt-77291",
    "teamA": "t-1",
    "teamB": "t-2",
    "scoreA": 3,
    "scoreB": 1,
    "status": "completed"
  }
}
```

---

## 🔐 Stream Security & Networking Optimization

*   **HTML5 Native Connection Bypass**: Native browser `EventSource` wrappers do not support custom request headers (preventing simple `Authorization: Bearer <JWT>` usage on live stream subscriptions). 
*   **Security Fallback Solution**: `JwtRequestFilter` has been hardened to securely read verification tokens directly from URL query parameters (e.g. `/api/events/live?token=ey...`) if standard headers are not present, establishing secure user validation.
*   **Session Lifecycle Management**: `SseService` sets a 15-minute connection timeout window. The consumer systematically purges dead or disconnected client channels automatically whenever a broadcast failure occurs, maintaining optimal memory usage on the JVM.
*   **CORS Coordination**: Pre-flight checks and cross-origin resource permissions are strictly configured to bind React's UI and the REST broker endpoints without domain mismatches.

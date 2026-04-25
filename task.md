# Task: Kubernetes Configuration Comparison Tool

## Phase 1: Backend Setup & Security
- [x] Initialize Spring Boot maven project with MongoDB and Security dependencies.
- [x] Implement User Auth (Registration, Login, JWT, OTP via Email).
- [x] Implement Security Suite (CSRF, Rate Limiting, Audit Logging, XSS Sanitization).
- [x] Implement Credential Encryption/Decryption.

## Phase 2: K8s Infrastructure & Core Logic
- [x] Implement K8s Client Factory with SSH Tunneling support.
- [x] Implement Core Comparison Logic (Deployments, ConfigMaps, PVCs, Services).
- [x] Implement Istio Comparison Logic (VirtualService, AuthorizationPolicy).
- [x] Implement YAML Diffing logic for line-by-line comparison.

## Phase 3: Advanced Backend Features
- [x] Implement "Golden Baseline" persistence.
- [x] Implement Export System (Report generation).
- [x] Implement History Management (Last 10 records).
- [x] Implement null-safe string utility and update `BaselineController`
- [x] Update `ComparisonController` with similar null-safety
- [x] Fix null-safety and session leaks in `K8sClientFactory`
- [x] Add null-safety to `BaselineService`

## Phase 4: Frontend Development
- [x] Initialize Angular project with Tailwind CSS.
- [x] Build Auth Components (Login, Signup, OTP).
- [x] Build Sidebar & Navigation.
- [x] Build 4-Step Wizard:
    - [x] Step 1: Connectivity & "Save" option.
    - [x] Step 2: Namespace & Filter configuration.
    - [x] Step 3: Resource selection.
    - [x] Step 4: Results Dashboard (Search/Filter, Diff Tables, YAML View).
- [x] Integrate Export & Baseline actions.
- [x] Update `BaselinesComponent` with dynamic validation logic
- [x] Update `BaselinesComponent` HTML with error messages and indicators
- [x] Fix `openForm` and `reset` behavior to avoid null fields

## Phase 5: Testing & Verification
- [x] Verify Auth & Security flows.
- [x] Verify K8s comparison results.
- [x] Verify MongoDB persistence & history.
- [x] Final UI/UX polish.

## Phase 6: Expanded Baseline Features
- [ ] Implement `@GetMapping("/{id}")` in `BaselineController` [/]
- [ ] Add `updateBaseline` and `getBaselineById` to `ApiService` [ ]
- [ ] Implement `onView` modal in `BaselinesComponent` [ ]
- [ ] Implement `onRefresh` logic in `BaselinesComponent` [ ]
- [ ] Integrate detailed comparison results view in `BaselinesComponent` [ ]

## Phase 7: Verification
- [ ] Verify View functionality [ ]
- [ ] Verify Update/Refresh functionality [ ]
- [ ] Verify Comparison results display [ ]

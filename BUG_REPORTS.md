# Bug Reports

This file is generated from InsightDesk ticket data.
Use it as a curated engineering backlog for review and fixes.

Generated: Jun 26, 2026, 1:06 AM
Support tickets in database: 6
Tickets routed to insights: 3
Open or active insight tickets: 3
Fixed insight tickets: 0

## How To Use

1. Run the refresh command to pull the latest tickets from the database.
2. Review the items below and decide which ones should be fixed next.
3. Fix issues manually or ask the agent to address one or more BUG IDs.

## BUG-MUYTE3 - support_guidance
- Ticket ID: cmqu1xq4y0001l6gsfzmuyte3
- Status: new
- Triage: support_guidance
- Repeat count: 2
- Surfaced because: Similar support friction has appeared more than once.
- Created: Jun 26, 2026, 1:06 AM

### User Question
Why did my shipment status stay pending after stock was removed?

### Assistant Answer
1) The likely explanation for your shipment status remaining pending after stock was removed is that the final confirmation step for processing the shipment was not completed successfully. This means the system has registered the stock removal but has not finalized the shipment status update.

2) The next action inside InsightDesk is to review the latest shipment event and confirm that the processing step completed successfully. You should refresh the shipment record to ensure you are seeing the most current data, then retry the final confirmation step for the shipment. 

3) If, after retrying and refreshing, the shipment status still remains pending and the system appears blocked, you should escalate the issue for human follow-up. This escalation is necessary to investigate any potential system or data issues that are preventing completion of the shipment process.

### Failure Reason
The AI answer assumes that the user has access to and knowledge of a 'final confirmation step' and how to 'retry' it, but InsightDesk may not clearly surface this step or guide users through it, causing confusion when shipment status remains pending despite stock removal.

### Suggested Fix
Improve the AI response by explicitly stating where to find the confirmation step within the shipment status interface, including screenshots or navigation hints, and clarify what user actions are needed to complete the status update. Additionally, verify if the platform UI clearly supports and indicates this step to users.

## BUG-0FM9DL - Workflow improvement
- Ticket ID: cmqu1x73f0000l68k1x0fm9dl
- Status: new
- Triage: product_gap
- Repeat count: 2
- Surfaced because: Classified as a product or UX gap worth reviewing.
- Created: Jun 26, 2026, 1:06 AM

### User Question
Why did the low-stock badge appear but no reorder shortcut showed up?

### Assistant Answer
Open the item details page and retry the update from the actions panel.

### Failure Reason
The answer points to an item details page that does not exist in the current workflow.

### Suggested Fix
Expose reorder guidance directly from the main inventory board when stock falls below threshold.

## BUG-HZKS7K - Navigation improvement
- Ticket ID: cmqu1x73f0002l68k9mhzks7k
- Status: new
- Triage: product_gap
- Repeat count: 2
- Surfaced because: Similar support friction has appeared more than once.
- Created: Jun 26, 2026, 1:06 AM

### User Question
Where can I review unresolved support issues from the chat?

### Assistant Answer
Open the insights dashboard to review unresolved support escalations.

### Failure Reason
The answer assumes the user already knows where the dashboard is and what it contains.

### Suggested Fix
Link directly to the insights dashboard from the support page and explain what users will find there.

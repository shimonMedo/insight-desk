# Reorder Statuses

InsightDesk uses simple reorder states to explain what is happening with inventory:

- `none` means no reorder activity is currently tracked
- `pending` means stock is low and the item should be reviewed for reorder
- `ordered` means the team has already marked the item as reordered

In the UI, users should treat `pending` as an action signal and `ordered` as a confirmation that replenishment has already been placed.

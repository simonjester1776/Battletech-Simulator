# Save Management Features

## New Features Added

### 1. Settings Menu
Access save management through the new **Settings** button in the battle screen.

### 2. Save Statistics
View information about your saved games:
- Total number of saves
- Storage space used

### 3. Delete Individual Saves
- Hover over any save in the Load dialog
- Click the trash icon to delete that specific save
- Confirmation required

### 4. Reset Current Game
- Opens the Settings dialog
- Click "Reset Current Game"
- Returns to main menu
- Confirmation required

### 5. Delete All Saves (Wipe Data)
- Opens the Settings dialog
- Click "Delete All Saves"
- Shows detailed confirmation:
  - Number of saves to be deleted
  - Storage space to be freed
  - Cannot be undone warning
- Confirmation required

---

## How to Use

### Access Settings
```
Battle Screen → Settings Button (⚙️)
```

### View Save Stats
1. Click Settings button
2. See statistics panel showing:
   - Total Saves: X
   - Storage Used: XX KB

### Delete a Single Save
1. Click Load button
2. Hover over a save
3. Click the trash icon (🗑️)
4. Confirm deletion

### Reset Current Game
1. Click Settings button
2. Click "Reset Current Game" (⚠️)
3. Confirm in popup
4. Returns to main menu

### Delete All Saves
1. Click Settings button
2. Click "Delete All Saves (X)" (🗑️)
3. Review confirmation dialog showing:
   - Number of saves
   - Storage to be freed
4. Click "Delete All Saves" to confirm
5. All saves permanently deleted

---

## Safety Features

### Confirmations
- Reset game: Browser confirmation
- Delete single save: Browser confirmation
- Delete all saves: Dedicated dialog with details

### Visual Warnings
- Yellow color for reset (⚠️)
- Red color for delete operations (🗑️)
- Alert boxes with warnings

### Disabled States
- "Delete All Saves" button disabled when no saves exist
- Shows helpful message when no saves

### Storage Info
- See exactly how much space will be freed
- See total number of saves before deletion

---

## Keyboard Shortcuts

Existing shortcuts still work:
- `Ctrl/Cmd + S` - Quick save
- `Ctrl/Cmd + L` - Load menu
- `Ctrl/Cmd + E` - Export game file

---

## Technical Details

### localStorage Keys
- Save files: `battletech_save_XXXXX`
- Save list: `battletech_save_list`

### Functions Added
```typescript
deleteAllSaves(): boolean
getSaveStats(): { totalSaves: number; totalSize: number }
```

### File Sizes
- Average save: ~5-10 KB
- Browser limit: Usually 5-10 MB (plenty of space)

---

## Use Cases

### Clean Up Old Saves
When you have too many test saves or old games.

### Free Up Space
If running low on localStorage (rare but possible).

### Start Fresh
Begin a new campaign without old save clutter.

### Troubleshooting
If saves are corrupted, wipe all and start fresh.

---

## FAQ

**Q: Can I recover deleted saves?**
A: No, deletion is permanent. Use Export (Ctrl+E) to backup important saves.

**Q: How many saves can I have?**
A: Technically unlimited, but localStorage has ~5-10 MB limit.

**Q: Will this delete my campaign progress?**
A: Only if campaign progress is in the deleted save. Export important games first.

**Q: Can I export before wiping?**
A: Yes! Export important saves with Ctrl+E before deleting.

**Q: What happens if I close the dialog?**
A: Nothing is deleted unless you confirm.

---

## Best Practices

1. **Export Important Saves**: Use Ctrl+E before deleting
2. **Name Saves Clearly**: Easier to identify what to keep
3. **Regular Cleanup**: Delete old test saves periodically
4. **Check Statistics**: Know your storage usage

---

## Screenshots

### Settings Dialog
```
┌─────────────────────────────────┐
│ Game Settings                   │
├─────────────────────────────────┤
│ Save Data Statistics            │
│   Total Saves: 5                │
│   Storage Used: 47.3 KB         │
├─────────────────────────────────┤
│ [⚠️ Reset Current Game]         │
│ [🗑️ Delete All Saves (5)]      │
└─────────────────────────────────┘
```

### Delete Confirmation
```
┌─────────────────────────────────┐
│ ⚠️ Delete All Saves?            │
├─────────────────────────────────┤
│ This action cannot be undone!   │
│                                 │
│ You are about to delete 5 saves │
│ This will free up 47.3 KB       │
├─────────────────────────────────┤
│ [Cancel] [🗑️ Delete All Saves] │
└─────────────────────────────────┘
```

---

## Version History

**v2.1.0** - Added save management features
- Settings dialog
- Save statistics
- Individual save deletion
- Reset game function
- Wipe all saves function

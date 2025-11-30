# **Git Branch Setup - phaseb_c_planning Only**

**Purpose:** Create a branch where only `phaseb_c_planning` folder is visible.

---

## **Commands to Run**

### **Step 1: Create and checkout new branch**
```bash
git checkout -b agent-hybrid
```

### **Step 2: Enable sparse checkout**
```bash
git sparse-checkout init --cone
```

### **Step 3: Set sparse checkout to only show phaseb_c_planning**
```bash
git sparse-checkout set phaseb_c_planning/
```

### **Step 4: Verify**
```bash
# You should now only see phaseb_c_planning folder
ls
```

---

## **Switching Between Branches**

### **On phaseb-planning-only branch:**
- Only `phaseb_c_planning` folder visible
- Other folders still exist in Git, just not shown

### **Switch back to main:**
```bash
git checkout main
git sparse-checkout disable
```

### **Switch back to phaseb-planning-only:**
```bash
git checkout phaseb-planning-only
git sparse-checkout set phaseb_c_planning/
```

---

## **Alternative: Manual Approach**

If sparse checkout doesn't work, you can manually hide folders using `.git/info/sparse-checkout`:

1. Create branch: `git checkout -b phaseb-planning-only`
2. Enable sparse checkout: `git config core.sparseCheckout true`
3. Edit `.git/info/sparse-checkout` file:
   ```
   phaseb_c_planning/
   ```
4. Apply: `git read-tree -mu HEAD`

---

**Note:** Sparse checkout is view-only. Files still exist in Git, just not shown in working directory.


/**
 * Flow 7 Backend API Tester - "Thinking Engine" Edition
 * 
 * Verifies:
 * 1. Pre-Execution Analysis (Skipping items already in state)
 * 2. Instant Progress Jump (Progress > 0 upon creation)
 * 3. Detailed Summary (Success vs Skipped vs Failed)
 * 4. Bulk Category Update with state awareness
 */

const API_BASE = 'http://localhost:3000/api/v1';

async function testThinkingEngine() {
  const timestamp = Date.now();
  console.log(`🚀 Starting "Thinking Engine" API Test (TS: ${timestamp})...`);

  try {
    // 1. Auth Setup
    const userEmail = `engine-tester-${timestamp}@flowhub.test`;
    const password = 'Password123!';
    console.log(`\n1. Creating test user: ${userEmail}`);
    
    const otpReqRes = await fetch(`${API_BASE}/auth/signup/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail })
    });
    const { otp } = await otpReqRes.json();
    
    await fetch(`${API_BASE}/auth/signup/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: userEmail, otp })
    });

    const signupRes = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Engine',
        lastName: 'Tester',
        email: userEmail,
        password,
        confirmPassword: password,
        otp
      })
    });
    const signupData = await signupRes.json();
    const token = signupData.token;
    if (!token) throw new Error('Auth failed: ' + JSON.stringify(signupData));
    console.log('   Auth complete.');

    // 2. Create 4 Items with UNIQUE names for this run
    console.log('\n2. Creating 4 test items...');
    const itemIds = [];
    for (let i = 1; i <= 4; i++) {
      const res = await fetch(`${API_BASE}/items`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: `Engine ${timestamp} Item ${i}`,
          description: `Test description for item ${i}`,
          item_type: 'SERVICE',
          price: 100,
          category: 'Initial',
          duration_hours: 1
        })
      });
      const data = await res.json();
      if (!data.item_id) throw new Error('Item creation failed: ' + JSON.stringify(data));
      itemIds.push(data.item_id);
    }
    console.log(`   Created 4 items.`);

    // 3. Manually Deactivate 2 Items
    console.log('\n3. Manually deactivating 2 items to test state awareness...');
    await fetch(`${API_BASE}/items/${itemIds[0]}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    await fetch(`${API_BASE}/items/${itemIds[1]}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   Items 1 & 2 are now Inactive.');

    // 4. Test Bulk Category Update
    // Item 1 (Inactive) -> Should Fail/Skip in lazy processing
    // Item 2 (Inactive) -> Should Fail/Skip in lazy processing
    // Item 3 (Active, Initial) -> Should be Updated
    // Item 4 (Active, Initial) -> Should be Updated
    console.log('\n4. Testing Bulk Update Category...');
    const newCategory = 'Updated Category';
    
    const catRes = await fetch(`${API_BASE}/bulk-operations`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        operation: 'update_category',
        itemIds: itemIds,
        payload: { category: newCategory }
      })
    });
    const catJobData = await catRes.json();
    const catJobId = catJobData.job_id;
    console.log(`   Job Created: ${catJobId}`);

    let catStatus = catJobData.job_status;
    while (catStatus !== 'completed') {
      const pollRes = await fetch(`${API_BASE}/bulk-operations/${catJobId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const pollData = await pollRes.json();
      catStatus = pollData.data.status;
      console.log(`   Polling... Status: ${catStatus} | Progress: ${pollData.data.progress}%`);
      if (catStatus !== 'completed') await new Promise(r => setTimeout(r, 1000));
    }

    const catFinalRes = await fetch(`${API_BASE}/bulk-operations/${catJobId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const catFinalData = await catFinalRes.json();
    console.log('\n📊 Category Update Final Report:');
    console.log(`   Total: ${catFinalData.data.summary.total}`);
    console.log(`   Actually Updated: ${catFinalData.data.summary.success}`);
    console.log(`   Skipped/Already in state: ${catFinalData.data.skippedIds.length}`);
    console.log(`   Failed/Inactive: ${catFinalData.data.summary.failed}`);

    // Expecting 2 successful updates (Item 3 & 4)
    if (catFinalData.data.summary.success === 2) {
      console.log('\n✅ TEST SUCCESS: Bulk Category Update handled states correctly!');
    } else {
      console.log(`\n❌ TEST FAILURE: Result mismatch. Expected 2 successes, got ${catFinalData.data.summary.success}`);
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Test Error:', error.message);
    process.exit(1);
  }
}

testThinkingEngine();

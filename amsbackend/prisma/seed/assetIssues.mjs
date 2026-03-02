
export async function seedAssetIssues(prisma, defaultGroup) {
  // 1. Get the default client group
    // 2. Get all assets belonging to this client group
  
    const assets = await prisma.assets.findMany({
    where: { clientGroupId: defaultGroup.id },
  });

  if (assets.length === 0) {
    console.log("❌ No assets found for this client group. Cannot seed issues.");
    return;
  }
  
// 3. Create dynamic issues for each asset
  const issueData = assets.map((asset, index) => ({
    assetId: asset.id,
    code: `ISSUE-${index + 1}`, // dynamic code
    title: `Issue for ${asset.structure_name || "Unnamed Asset"}`, // dynamic title
    issue: `Auto-generated issue for asset ID ${asset.id}`, // dynamic description
    score: Math.floor(Math.random() * 100), // dynamic score
    mitigation: "Pending assessment",
    clientGroupId: defaultGroup.id,
  }));

  // 4. Insert issues
  await prisma.assetIssue.createMany({
    data: issueData,
  });

  console.log(`✅ Seeded ${issueData.length} dynamic asset issues`);

}
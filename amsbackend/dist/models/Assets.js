"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssets = getAssets;
exports.getAssetById = getAssetById;
exports.createAsset = createAsset;
exports.updateAsset = updateAsset;
exports.deleteAsset = deleteAsset;
exports.restoreAsset = restoreAsset;
const client_1 = require("../prisma/client");
function prismaClient() { return (0, client_1.getPrisma)(); }
// Helper: build correct where clause
function buildWhere(clientGroupId, isDeleted, isAppAdmin) {
    if (isAppAdmin) {
        // ⭐ app_admin → sees ALL assets
        return { is_deleted: isDeleted };
    }
    if (clientGroupId === null) {
        // ⭐ single_user → only assets with clientGroupId = null
        return {
            is_deleted: isDeleted,
            clientGroupId: null
        };
    }
    // ⭐ company users → group assets + legacy
    return {
        is_deleted: isDeleted,
        OR: [
            { clientGroupId },
            { clientGroupId: null }
        ]
    };
}
// GET ALL ASSETS
async function getAssets(clientGroupId, isAppAdmin) {
    return prismaClient().assets.findMany({
        where: buildWhere(clientGroupId, false, isAppAdmin),
        orderBy: { id: "desc" }
    });
}
// GET ASSET BY ID
async function getAssetById(id, clientGroupId, isAppAdmin) {
    const asset = await prismaClient().assets.findFirst({
        where: {
            id,
            ...buildWhere(clientGroupId, false, isAppAdmin)
        }
    });
    if (!asset) {
        return {
            isNewAsset: true,
            asset: null
        };
    }
    return {
        isNewAsset: false,
        asset
    };
}
// CREATE ASSET
async function createAsset(assetData, clientGroupId, isAppAdmin) {
    return prismaClient().assets.create({
        data: {
            elr: assetData.elr,
            structure_no: assetData.structure_no,
            mileage: assetData.mileage,
            structure_type: assetData.structure_type,
            spans: assetData.spans,
            structure_name: assetData.structure_name,
            location: assetData.location,
            carries: assetData.carries,
            material_type: assetData.material_type,
            work_item: assetData.work_item,
            possible_consequence: assetData.possible_consequence,
            current_likelihood: assetData.current_likelihood,
            current_severity: assetData.current_severity,
            current_rating: assetData.current_rating,
            current_date_logged: assetData.current_date_logged,
            risk_mitigation_proposals: assetData.risk_mitigation_proposals,
            mitigation_likelihood: assetData.mitigation_likelihood,
            mitigation_severity: assetData.mitigation_severity,
            mitigation_rating: assetData.mitigation_rating,
            mitigation_completion: assetData.mitigation_completion,
            status: assetData.status,
            detailed_exam_years: assetData.detailed_exam_years,
            last_exam: assetData.last_exam,
            next_exam: assetData.next_exam,
            visual_report: assetData.visual_report,
            detailed_report: assetData.detailed_report,
            assessment: assetData.assessment,
            records: assetData.records,
            riskRating: assetData.risk_rating,
            latitude: assetData.latitude,
            longitude: assetData.longitude,
            clientGroupId: clientGroupId
        }
    });
}
// UPDATE ASSET
async function updateAsset(id, assetData, clientGroupId, isAppAdmin) {
    const asset = await prismaClient().assets.findFirst({
        where: {
            id,
            ...buildWhere(clientGroupId, false, isAppAdmin)
        }
    });
    if (!asset)
        return null;
    return prismaClient().assets.update({
        where: { id },
        data: {
            structure_no: assetData.structure_no,
            mileage: assetData.mileage,
            structure_type: assetData.structure_type,
            spans: assetData.spans,
            structure_name: assetData.structure_name,
            location: assetData.location,
            carries: assetData.carries,
            material_type: assetData.material_type,
            work_item: assetData.work_item,
            possible_consequence: assetData.possible_consequence,
            current_likelihood: assetData.current_likelihood,
            current_severity: assetData.current_severity,
            current_rating: assetData.current_rating,
            current_date_logged: assetData.current_date_logged,
            risk_mitigation_proposals: assetData.risk_mitigation_proposals,
            mitigation_likelihood: assetData.mitigation_likelihood,
            mitigation_severity: assetData.mitigation_severity,
            mitigation_rating: assetData.mitigation_rating,
            mitigation_completion: assetData.mitigation_completion,
            status: assetData.status,
            detailed_exam_years: assetData.detailed_exam_years,
            last_exam: assetData.last_exam,
            next_exam: assetData.next_exam,
            visual_report: assetData.visual_report,
            detailed_report: assetData.detailed_report,
            assessment: assetData.assessment,
            records: assetData.records,
            riskRating: assetData.risk_rating,
            latitude: assetData.latitude,
            longitude: assetData.longitude
        }
    });
}
// DELETE ASSET (SOFT DELETE)
async function deleteAsset(id, deletedBy, clientGroupId, isAppAdmin) {
    const asset = await prismaClient().assets.findFirst({
        where: {
            id,
            ...buildWhere(clientGroupId, false, isAppAdmin)
        }
    });
    if (!asset)
        return null;
    await prismaClient().assets.update({
        where: { id },
        data: { is_deleted: true }
    });
    await prismaClient().asset_deletion_log.create({
        data: {
            asset_id: id,
            deleted_by: deletedBy,
            asset_snapshot: asset
        }
    });
    const updatedAsset = await prismaClient().assets.findUnique({ where: { id } });
    return {
        success: true,
        message: "Soft deleted successfully",
        asset: updatedAsset
    };
}
// RESTORE ASSET
async function restoreAsset(id, clientGroupId, isAppAdmin) {
    const asset = await prismaClient().assets.findFirst({
        where: {
            id,
            ...buildWhere(clientGroupId, true, isAppAdmin)
        }
    });
    if (!asset)
        return null;
    await prismaClient().assets.update({
        where: { id },
        data: { is_deleted: false }
    });
    const updatedAsset = await prismaClient().assets.findUnique({ where: { id } });
    return {
        success: true,
        message: "Asset restored successfully",
        asset: updatedAsset
    };
}
//# sourceMappingURL=Assets.js.map
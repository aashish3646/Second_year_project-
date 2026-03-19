from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from .models import DocumentType, IntendedItemCategory, SellerType


@dataclass(frozen=True)
class DocumentRequirement:
    document_type: str
    required: bool = True


BASE_REQUIREMENTS_BY_SELLER_TYPE: dict[str, list[DocumentRequirement]] = {
    SellerType.INDIVIDUAL: [
        DocumentRequirement(DocumentType.CITIZENSHIP),
        DocumentRequirement(DocumentType.SELFIE),
    ],
    SellerType.BUSINESS: [
        DocumentRequirement(DocumentType.BUSINESS_REGISTRATION),
        DocumentRequirement(DocumentType.PAN_VAT),
        DocumentRequirement(DocumentType.CITIZENSHIP),
    ],
    SellerType.CORPORATE: [
        DocumentRequirement(DocumentType.COMPANY_REGISTRATION),
        DocumentRequirement(DocumentType.PAN_VAT),
        DocumentRequirement(DocumentType.AUTH_REPRESENTATIVE_ID),
        DocumentRequirement(DocumentType.AUTHORIZATION_LETTER),
    ],
}


CATEGORY_REQUIREMENTS: dict[str, list[DocumentRequirement]] = {
    IntendedItemCategory.GENERAL_GOODS: [
        DocumentRequirement(DocumentType.OWNERSHIP_PROOF, required=False),
    ],
    IntendedItemCategory.VEHICLES: [
        DocumentRequirement(DocumentType.VEHICLE_BLUEBOOK),
        DocumentRequirement(DocumentType.OWNERSHIP_PROOF),
        DocumentRequirement(DocumentType.TAX_CLEARANCE, required=False),
    ],
    IntendedItemCategory.PROPERTY: [
        DocumentRequirement(DocumentType.PROPERTY_OWNERSHIP),
        DocumentRequirement(DocumentType.PROPERTY_LEGAL),
        DocumentRequirement(DocumentType.OWNERSHIP_PROOF),
    ],
    IntendedItemCategory.BUSINESS_INVENTORY: [
        DocumentRequirement(DocumentType.BUSINESS_REGISTRATION),
        DocumentRequirement(DocumentType.INVOICE_SOURCE_PROOF),
        DocumentRequirement(DocumentType.PAN_VAT),
    ],
    IntendedItemCategory.LUXURY: [
        DocumentRequirement(DocumentType.OWNERSHIP_PROOF),
        DocumentRequirement(DocumentType.AUTHENTICITY_PROOF, required=False),
    ],
}


def required_document_types(*, seller_type: str, intended_item_categories: Iterable[str]) -> set[str]:
    reqs: list[DocumentRequirement] = []
    reqs.extend(BASE_REQUIREMENTS_BY_SELLER_TYPE.get(seller_type, []))
    for cat in intended_item_categories or []:
        reqs.extend(CATEGORY_REQUIREMENTS.get(cat, []))
    return {r.document_type for r in reqs if r.required}


def all_document_types(*, seller_type: str, intended_item_categories: Iterable[str]) -> set[str]:
    reqs: list[DocumentRequirement] = []
    reqs.extend(BASE_REQUIREMENTS_BY_SELLER_TYPE.get(seller_type, []))
    for cat in intended_item_categories or []:
        reqs.extend(CATEGORY_REQUIREMENTS.get(cat, []))
    return {r.document_type for r in reqs}


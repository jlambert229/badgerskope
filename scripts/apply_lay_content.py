#!/usr/bin/env python3
"""Apply lay-friendly side-effect data and notes to the peptide database."""
import json
from pathlib import Path

DB = Path("peptide-info-database.json")

# Identity-verification reminder appended to vendor-coded entries
IDENTITY_REMINDER = (
    " The vendor code on this listing is shorthand; confirm the actual contents "
    "with a certificate of analysis before relying on it."
)

# title-prefix -> payload. Use lowercased title prefix matching.
PAYLOADS = {
    "2g-tz": {
        "common": [
            "Nausea, especially when starting treatment or increasing the dose",
            "Diarrhea",
            "Vomiting",
            "Constipation",
            "Decreased appetite and indigestion",
            "Stomach (abdominal) pain",
        ],
        "serious": [
            "Possible thyroid C-cell tumors, including medullary thyroid carcinoma (boxed warning); not for people with a personal or family history of MTC or MEN 2",
            "Pancreatitis (severe stomach pain that may radiate to the back)",
            "Gallbladder problems, including gallstones and inflammation",
            "Low blood sugar, mainly when combined with insulin or sulfonylureas",
            "Kidney injury linked to dehydration from vomiting or diarrhea, plus reports of serious allergic reactions and worsening diabetic eye disease",
        ],
        "note": (
            "Tirzepatide is the active ingredient in the FDA-approved prescription "
            "medicines Mounjaro (for type 2 diabetes) and Zepbound (for chronic "
            "weight management), both made by Eli Lilly. It works on two gut-hormone "
            "receptors (GLP-1 and GIP) that influence blood sugar and appetite."
            + IDENTITY_REMINDER
        ),
    },
    "3g-rt": {
        "common": [
            "Nausea, most often during dose increases",
            "Diarrhea",
            "Vomiting",
            "Constipation",
            "Decreased appetite",
            "Mild, temporary increases in heart rate",
        ],
        "serious": [
            "Pancreatitis was reported in a small number of trial participants",
            "Gallbladder-related events such as gallstones",
            "Modest rises in heart rate that warrant monitoring",
            "Because it activates the glucagon receptor, effects on blood sugar control and liver enzymes are being watched closely",
            "Long-term safety, including any thyroid risk seen with related drugs, is still being studied",
        ],
        "note": (
            "Retatrutide is an investigational once-weekly injectable being developed "
            "by Eli Lilly for obesity and type 2 diabetes. It is a triple agonist that "
            "acts on three hormone receptors (GLP-1, GIP, and glucagon). It is not "
            "approved by the FDA and is not available by prescription."
            + IDENTITY_REMINDER
        ),
    },
    "cag-": {
        "common": [
            "Nausea, particularly when starting or moving to a higher dose",
            "Vomiting",
            "Diarrhea or constipation",
            "Decreased appetite",
            "Injection-site reactions such as redness or itching",
            "Fatigue",
        ],
        "serious": [
            "Pancreatitis has been reported infrequently in trials of cagrilintide and the CagriSema combination",
            "Gallbladder problems, including gallstones",
            "Possible allergic or hypersensitivity reactions",
            "When combined with semaglutide (CagriSema), risk of low blood sugar increases, especially with other diabetes medicines",
            "Long-term safety is still being evaluated in ongoing Phase 3 studies",
        ],
        "note": (
            "Cagrilintide is an investigational long-acting amylin analog from Novo "
            "Nordisk being studied for weight management, most prominently as part of "
            "CagriSema, a fixed-dose combination with semaglutide (the active "
            "ingredient in Wegovy and Ozempic). It is not approved by the FDA and is "
            "not available by prescription."
            + IDENTITY_REMINDER
        ),
    },
    "survodutide": {
        "common": [
            "Nausea, especially during dose escalation",
            "Vomiting",
            "Diarrhea",
            "Constipation",
            "Decreased appetite",
            "Injection-site reactions",
        ],
        "serious": [
            "Pancreatitis was reported in a small number of participants",
            "Gallbladder-related events",
            "Modest increases in heart rate",
            "Because it activates the glucagon receptor, effects on blood sugar, liver enzymes, and metabolism are being monitored",
            "Long-term safety, including any cardiovascular or thyroid signals, is still being studied",
        ],
        "note": (
            "Survodutide is an investigational once-weekly injectable being co-developed "
            "by Boehringer Ingelheim and Zealand Pharma for obesity and metabolic "
            "dysfunction-associated steatohepatitis (MASH). It is a dual agonist that "
            "activates both the GLP-1 and glucagon receptors. It is not approved by "
            "the FDA and is not available by prescription."
            + IDENTITY_REMINDER
        ),
    },
    "tesa-": {
        "common": [
            "Joint pain or stiffness",
            "Redness, itching, rash, or bruising at the injection site",
            "Muscle pain",
            "Swelling in the hands or feet (fluid retention)",
            "Tingling or numbness in the hands",
            "Upset stomach or nausea",
        ],
        "serious": [
            "Higher blood sugar, which may worsen or trigger diabetes",
            "Serious allergic reactions (hives, trouble breathing, swelling of the face)",
            "Possible increased risk of cancer growth in people with active cancer",
            "Fluid buildup around the wrist nerve causing carpal tunnel symptoms",
        ],
        "note": (
            "Tesamorelin, sold under the brand name Egrifta, is an FDA-approved "
            "injectable medicine that prompts the body to release more of its own "
            "growth hormone. It is approved specifically to reduce excess belly fat "
            "in adults living with HIV who have lipodystrophy."
            + IDENTITY_REMINDER
        ),
    },
    "pt-141": {
        "common": [
            "Nausea (sometimes strong, especially after the first dose)",
            "Flushing or warmth in the face",
            "Headache",
            "Injection-site reactions such as redness or irritation",
            "Vomiting",
            "Temporary darkening of the skin, gums, or face (hyperpigmentation)",
        ],
        "serious": [
            "Temporary rises in blood pressure and small drops in heart rate after each dose, so it is not recommended for people with uncontrolled high blood pressure or known heart disease",
            "Focal hyperpigmentation that may not fully fade after stopping",
            "Severe nausea that may require anti-nausea medicine",
            "Allergic reactions",
        ],
        "note": (
            "Bremelanotide, sold as Vyleesi (also called PT-141 in research), is an "
            "FDA-approved on-demand injection for premenopausal women with acquired, "
            "generalized hypoactive sexual desire disorder. The FDA label warns it "
            "can transiently raise blood pressure, so it should not be used by people "
            "with uncontrolled hypertension or known cardiovascular disease."
            + IDENTITY_REMINDER
        ),
    },
    "oxytocin": {
        "common": [
            "Nausea or vomiting",
            "Stronger or more frequent contractions during labor",
            "Headache",
            "Faster or irregular heartbeat",
            "Flushing",
        ],
        "serious": [
            "Excessively strong contractions that can injure the uterus or harm the baby",
            "Dangerously low sodium and water retention with prolonged use, which can cause seizures",
            "Serious allergic reactions",
            "Bleeding after delivery",
            "Changes in blood pressure and heart rhythm",
        ],
        "note": (
            "Oxytocin is a natural hormone made by the brain; the injectable form "
            "(brand name Pitocin) is FDA-approved to start or strengthen labor and to "
            "control bleeding after childbirth. Intranasal and other uses for bonding, "
            "anxiety, or autism are off-label and not FDA-approved."
            + IDENTITY_REMINDER
        ),
    },
    "sermorelin": {
        "common": [
            "Pain, redness, swelling, or itching at the injection site",
            "Flushing or warmth in the face",
            "Headache",
            "Nausea",
            "Trouble swallowing",
            "Dizziness",
        ],
        "serious": [
            "Allergic reactions, including rash or trouble breathing",
            "Possible effects on thyroid hormone levels",
            "Unknown long-term safety when obtained from compounding pharmacies",
        ],
        "note": (
            "Sermorelin is a shortened version of growth-hormone-releasing hormone "
            "that signals the pituitary to release growth hormone. It was previously "
            "sold in the US as Geref for diagnosing and treating growth hormone "
            "deficiency, but the manufacturer withdrew it in 2008; today it is only "
            "available through compounding pharmacies, and the FDA has flagged "
            "compounded sermorelin as not an FDA-approved drug."
            + IDENTITY_REMINDER
        ),
    },
    "aod-9604": {
        # No side-effect data; just the identity note
        "common": [],
        "serious": [],
        "note": (
            "AOD-9604 is an experimental fragment of human growth hormone that was "
            "studied in the 2000s as a potential obesity treatment but failed to "
            "show meaningful weight-loss benefit in Phase 2b trials and was never "
            "approved by the FDA or any major regulator as a drug. The FDA has "
            "explicitly stated AOD-9604 is not an approved drug and has placed it "
            "on its list of bulk substances that compounding pharmacies may not use."
            + IDENTITY_REMINDER
        ),
    },
    "thymosin alpha-1": {
        "common": [
            "Discomfort, redness, or soreness at the injection site",
            "Mild flu-like feelings",
            "Muscle or joint aches",
            "Fatigue",
        ],
        "serious": [
            "Allergic reactions",
            "Theoretical risk of overstimulating the immune system in people with autoimmune disease or organ transplants",
        ],
        "note": (
            "Thymalfasin, also called thymosin alpha-1 and sold as Zadaxin, is a "
            "synthetic copy of a small immune-signaling peptide naturally made by "
            "the thymus gland. It is approved in more than 30 countries (including "
            "parts of Europe, Asia, and Latin America) to treat chronic hepatitis B "
            "and C and as an add-on for some cancers and vaccines, but it is not "
            "FDA-approved in the United States."
            + IDENTITY_REMINDER
        ),
    },
    "mt-1": {
        "common": [
            "Nausea",
            "Headache",
            "Implant-site reactions such as pain, redness, or bruising",
            "Darkening of the skin, freckles, and moles",
            "Fatigue",
            "Back pain",
        ],
        "serious": [
            "New or changing moles, so regular full-body skin exams by a dermatologist are required",
            "Possible masking of skin cancers because of overall skin darkening",
            "Allergic reactions",
        ],
        "note": (
            "Afamelanotide, sold as Scenesse, is an FDA-approved implant that "
            "increases skin pigment to help adults with erythropoietic protoporphyria "
            "tolerate light exposure without painful skin reactions. It is sometimes "
            "marketed by unregulated vendors as Melanotan-1 or MT-1, but only the "
            "Scenesse implant is FDA-approved; injectable copies sold online are not."
            + IDENTITY_REMINDER
        ),
    },
    "mt-ii": {
        "common": [
            "Nausea and vomiting",
            "Facial flushing",
            "Spontaneous erections in men",
            "Loss of appetite",
            "Darkening of moles, freckles, and overall skin",
            "Injection-site reactions",
        ],
        "serious": [
            "The FDA has warned that Melanotan II is an unapproved drug and that products sold online are not regulated for safety, purity, or sterility",
            "Published case reports describe new or rapidly changing moles, dysplastic nevi, and melanoma in users",
            "Reports of priapism (painful, prolonged erection requiring emergency care)",
            "Reports of kidney injury, posterior reversible encephalopathy syndrome (a brain swelling condition), and severe allergic reactions",
            "UK and EU regulators have issued similar safety alerts urging consumers not to use it",
        ],
        "note": (
            "Melanotan II (MT-II) is an unapproved synthetic analog of alpha-MSH, "
            "sold on the grey market as a tanning and libido aid. It is not approved "
            "by the FDA or any other major drug regulator, and the FDA, UK MHRA, and "
            "other agencies have issued public warnings against its use due to "
            "documented safety concerns including melanoma case reports."
            + IDENTITY_REMINDER
        ),
    },
}


def main() -> None:
    db = json.loads(DB.read_text())
    updated = []
    for entry in db["entries"]:
        title = entry.get("catalog", {}).get("title", "").lower()
        for prefix, payload in PAYLOADS.items():
            if title.startswith(prefix):
                if payload["common"] or payload["serious"]:
                    entry["commonSideEffects"] = {
                        "common": payload["common"],
                        "serious": payload["serious"],
                    }
                entry["notes"] = payload["note"]
                updated.append(entry["catalog"]["title"])
                break
    DB.write_text(json.dumps(db, indent=2) + "\n")
    print(f"Updated {len(updated)} entries:")
    for t in updated:
        print(f"  - {t}")


if __name__ == "__main__":
    main()

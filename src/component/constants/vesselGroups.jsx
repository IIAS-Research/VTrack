export const vesselGroups = {
  Cranial: {
    vessels: [
      "ICA", "MCA1", "MCA2", "MCA3",
      "ACA1", "ACA2", "ACA3",
      "PCA1", "PCA2", "PCA3",
      "BA", "VA", "PCOM", "SCA", "PCA"
    ],
    bifurcations: [
      "Bifurcation carotidienne",
      "MCA1 -> MCA2",
      "MCA2 -> MCA3",
      "ACA1 -> ACA2",
      "ACA2 -> ACA3",
      "PCA1 -> PCA2",
      "PCA2 -> PCA3",
      "M1 -> M1",
      "M2 -> M2",
      "M3 -> M3",
    ]
  },
  Abdominal: {
    vessels: [
      "Abdominal Aorta", "Celiac Trunk", "Left Gastric Artery", "Splenic Artery",
      "Common Hepatic Artery", "Gastroduodenal Artery", "Right Gastric Artery",
      "Left Hepatic Artery", "Right Hepatic Artery", "Superior Mesenteric Artery (SMA)",
      "Middle Colic Artery", "Right Colic Artery", "Ileocolic Artery", "Intestinal Branches",
      "Inferior Mesenteric Artery (IMA)", "Left Colic Artery", "Sigmoid Arteries",
      "Superior Rectal Artery", "Renal Arteries (Right and Left)", "Common Iliac Arteries (Right and Left)",
      "Internal Iliac Artery", "External Iliac Artery"
    ],
    bifurcations: ["Abdominal Aorta → Celiac Trunk",
      "Abdominal Aorta → SMA",
      "Abdominal Aorta → IMA",
      "Celiac Trunk → Left Gastric Artery",
      "Celiac Trunk → Common Hepatic Artery",
      "Celiac Trunk → Splenic Artery",
      "Common Hepatic Artery → Gastroduodenal Artery",
      "Common Hepatic Artery → Right Gastric Artery",
      "Common Hepatic Artery → Right Hepatic Artery",
      "Common Hepatic Artery → Left Hepatic Artery",
      "SMA → Middle Colic Artery",
      "SMA → Right Colic Artery",
      "SMA → Ileocolic Artery",
      "SMA → Intestinal Branches",
      "IMA → Left Colic Artery",
      "IMA → Sigmoid Arteries",
      "IMA → Superior Rectal Artery"]
  },
  Coronary: {
    vessels: [
      "Right Coronary Artery (RCA)", "Conus Branch", "Sinoatrial (SA) Nodal Branch",
      "Right Marginal Artery", "Posterior Descending Artery (PDA)",
      "Left Main Coronary Artery (LMCA)", "Left Anterior Descending (LAD)",
      "Left Circumflex (LCx)", "Ramus Intermedius"
    ],
    bifurcations: [
      "RCA → Conus Branch",
      "RCA → SA Nodal Branch",
      "RCA → Right Marginal Artery",
      "RCA → PDA",
      "LMCA → LAD",
      "LMCA → LCx",
      "LMCA → Ramus Intermedius"]
  },
  UpperLimb: {
    vessels: [
      "Subclavian Artery", "Axillary Artery", "Brachial Artery",
      "Radial Artery", "Ulnar Artery", "Palmar Arche",
      "Superficial Palmar Arch", "Deep Palmar Arch"
    ],
    bifurcations: [
      "Subclavian Artery → Axillary Artery",
      "Axillary Artery → Brachial Artery",
      "Brachial Artery → Radial Artery",
      "Brachial Artery → Ulnar Artery",
      "Ulnar Artery → Superficial Palmar Arch",
      "Radial Artery → Deep Palmar Arch"
    ]
  },
  LowerLimb: {
    vessels: [
      "Common Iliac Artery", "External Iliac Artery", "Internal Iliac Artery",
      "Femoral Artery", "Deep Femoral Artery", "Superficial Femoral Artery",
      "Popliteal Artery", "Anterior Tibial Artery", "Posterior Tibial Artery",
      "Fibular (Peroneal) Artery", "Medial Plantar Artery", "Lateral Plantar Artery",
      "Dorsalis Pedis Artery", "Arcuate Artery", "Deep Plantar Branch"
    ],
    bifurcations: [
      "Common Iliac Artery → External Iliac Artery",
      "Common Iliac Artery → Internal Iliac Artery",
      "External Iliac Artery → Femoral Artery",
      "Femoral Artery → Deep Femoral Artery",
      "Femoral Artery → Superficial Femoral Artery",
      "Popliteal Artery → Anterior Tibial Artery",
      "Popliteal Artery → Posterior Tibial Artery",
      "Posterior Tibial Artery → Fibular Artery"
    ]
  }
};
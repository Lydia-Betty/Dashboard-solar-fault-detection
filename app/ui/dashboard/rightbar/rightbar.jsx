"use client"
import { useState } from "react"
import styles from "./rightbar.module.css"

const panelModels = [
  {
    company: "ZERGOUN green energy",
    model: "MONO-PERC CELLULE M3",
    area: 1.7,
    efficiency: 0.19,
    type: "Monocrystalline",
  },
  {
    company: "ZERGOUN green energy",
    model: "MA 5BB",
    area: 1.6,
    efficiency: 0.17,
    type: "Polycrystalline",
  },
  {
    company: "ZERGOUN green energy",
    model: "POLY MA 5BB",
    area: 1.8,
    efficiency: 0.18,
    type: "Polycrystalline",
  },
  {
    company: "ZERGOUN green energy",
    model: "MONO-PERC M2",
    area: 2.0,
    efficiency: 0.20,
    type: "Monocrystalline",
  },
];

const Rightbar = ({ onSpecsChange }) => {
  const [selectedModel, setSelectedModel] = useState(panelModels[0]);
  const [customMode, setCustomMode] = useState(false);
  const [customSpecs, setCustomSpecs] = useState({
    area: "",
    efficiency: "",
    numberOfPanels: "",
  });

  const computeTotalArea = (area, count) => parseFloat(area || 0) * parseInt(count || 0);

  const handleModelSelect = (panel) => {
    setSelectedModel(panel);
    setCustomMode(false);
    onSpecsChange?.({
      area: panel.area,
      efficiency: panel.efficiency,
      numberOfPanels: 1,
      totalArea: panel.area,
    });
  };

  const handleCustomChange = (e) => {
    const { name, value } = e.target;
    setCustomSpecs((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomSubmit = () => {
    const { area, efficiency, numberOfPanels } = customSpecs;
    const totalArea = computeTotalArea(area, numberOfPanels);
    onSpecsChange?.({
      area: parseFloat(area),
      efficiency: parseFloat(efficiency),
      numberOfPanels: parseInt(numberOfPanels),
      totalArea,
    });
  };

  const toggleCustomMode = () => {
    setCustomMode((prev) => !prev);
    setSelectedModel(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleCustomSubmit();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>Available Solar Panels</div>
      <div className={styles.scrollArea}>
        {panelModels.map((panel, index) => (
          <div
            key={index}
            className={`${styles.panelCard} ${selectedModel?.model === panel.model && !customMode ? styles.active : ""}`}
            onClick={() => handleModelSelect(panel)}
          >
            <h4 className={styles.company}>{panel.company}</h4>
            <p className={styles.model}>{panel.model}</p>
            <p className={styles.detail}><b>Panel area:</b> {panel.area} m²</p>
            <p className={styles.detail}><b>Efficiency:</b> {(panel.efficiency * 100).toFixed(1)}%</p>
            <p className={styles.detail}><b>Type:</b> {panel.type}</p>
          </div>
        ))}
      

      <div className={styles.customInput}>
        <button onClick={toggleCustomMode}>
          {customMode ? "Cancel Custom Specs" : "Enter Custom Specs"}
        </button>

        {customMode && (
          <div className={styles.manualForm}>
            <label>
              Panel Area (m²):
              <input
                type="number"
                name="area"
                value={customSpecs.area}
                onChange={handleCustomChange}
                onKeyDown={handleKeyPress}
                step="0.01"
              />
            </label>
            <label>
              Number of Panels:
              <input
                type="number"
                name="numberOfPanels"
                value={customSpecs.numberOfPanels}
                onChange={handleCustomChange}
                onKeyDown={handleKeyPress}
                min="1"
              />
            </label>
            <label>
              Efficiency (0.00 - 1.00):
              <input
                type="number"
                name="efficiency"
                value={customSpecs.efficiency}
                onChange={handleCustomChange}
                onKeyDown={handleKeyPress}
                step="0.01"
                max="1"
                min="0"
              />
            </label>
            <p><b>Total Area:</b> {computeTotalArea(customSpecs.area, customSpecs.numberOfPanels)} m²</p>

            <button onClick={handleCustomSubmit}>Submit</button>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default Rightbar;
import type { EquipmentDefinition, EquipmentWithPlacement } from "../../domain/equipment/Equipment";
import { categoryLabel, translateReview } from "../../shared/formatting/boilerRoomFormatters";
import { EquipmentCardEditor } from "../../features/equipment-editor/EquipmentCardEditor";

export const EquipmentWorkspace = ({
  equipment,
  catalog,
  selectedId,
  onSelect,
  onAdd,
  onCatalogUpdate,
}: {
  equipment: EquipmentWithPlacement[];
  catalog: EquipmentDefinition[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAdd: (definition: EquipmentDefinition) => void;
  onCatalogUpdate: (catalog: EquipmentDefinition[]) => void;
}) => {
  const selected = equipment.find((entry) => entry.instance.id === selectedId) ?? equipment[0];
  return (
    <section>
      <div className="workspaceHeader">
        <p className="eyebrow">Каталог, состав проекта и карточка</p>
        <h2>Оборудование</h2>
      </div>
      <div className="split">
        <div className="listPane">
          <h3>Состав проекта</h3>
          {["boiler", "header", "valve"].map((category) => (
            <div key={category} className="groupBlock">
              <h4>{categoryLabel(category)}</h4>
              {equipment.filter((item) => item.definition.category === category).map((item) => (
                <button key={item.instance.id} type="button" className={item.instance.id === selectedId ? "row active" : "row"} onClick={() => onSelect(item.instance.id)}>
                  <span>{item.instance.label}</span>
                  <small>{item.placement?.placed ? "размещено" : "не размещено"} · {translateReview(item.instance.status)}</small>
                </button>
              ))}
            </div>
          ))}
          <h3>Добавить из каталога</h3>
          {catalog.filter((item) => item.category !== "dev_fixture").map((definition) => (
            <button key={definition.id} type="button" className="row" onClick={() => onAdd(definition)}>
              <span>{definition.name}</span>
              <small>{categoryLabel(definition.category)} · {definition.dimensions.widthMm} x {definition.dimensions.depthMm} мм</small>
            </button>
          ))}
        </div>
        {selected && <EquipmentCardEditor item={selected} catalog={catalog} onCatalogUpdate={onCatalogUpdate} />}
      </div>
    </section>
  );
};



export const PlanActions = ({
  selectedId,
  onRotate,
  onDelete,
}: {
  selectedId: string;
  onRotate: (id: string) => void;
  onDelete: (id: string) => void;
}) => (
  <div className="planActions">
    <span className="planHint">Навигация: тяните пустое место плана. Редактирование: тяните объект. Голубой контур — зона обслуживания.</span>
    <button type="button" onClick={() => onRotate(selectedId)}>Повернуть выбранный</button>
    <button type="button" className="dangerButton" onClick={() => onDelete(selectedId)}>Удалить выбранный</button>
  </div>
);

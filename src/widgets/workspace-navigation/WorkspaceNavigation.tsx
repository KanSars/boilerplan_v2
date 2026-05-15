import { workspaces, type HelpKey, type Workspace } from "../../shared/config/workspaces";

export const WorkspaceNavigation = ({
  activeWorkspace,
  onWorkspace,
  onHelp,
}: {
  activeWorkspace: Workspace;
  onWorkspace: (workspace: Workspace) => void;
  onHelp: (key: HelpKey) => void;
}) => (
  <nav className="workspaceNav" aria-label="Навигация по рабочим областям">
    {workspaces.map((item) => (
      <button
        key={item.id}
        type="button"
        className={activeWorkspace === item.id ? "active" : ""}
        onMouseEnter={() => onHelp(item.help)}
        onClick={() => {
          onWorkspace(item.id);
          onHelp(item.help);
        }}
      >
        {item.label}
      </button>
    ))}
  </nav>
);

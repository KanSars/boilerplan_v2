import type { ReactNode, RefObject } from "react";
import type { Project } from "../../domain/project/Project";
import type { ProjectReadinessReport } from "../../domain/validation/Validation";
import { helpText, type HelpKey, type Workspace } from "../../shared/config/workspaces";
import { ProjectStatusBar } from "../project-status-bar/ProjectStatusBar";
import { WorkspaceNavigation } from "../workspace-navigation/WorkspaceNavigation";

export const AppShell = ({
  project,
  readiness,
  workspace,
  helpMode,
  activeHelp,
  toast,
  fileInputRef,
  children,
  inspector,
  onWorkspace,
  onHelp,
  onToggleHelp,
  onSave,
  onLoadFile,
  onCheck,
  onDraftExport,
  onDismissToast,
}: {
  project: Project;
  readiness: ProjectReadinessReport;
  workspace: Workspace;
  helpMode: boolean;
  activeHelp: HelpKey;
  toast: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  children: ReactNode;
  inspector?: ReactNode;
  onWorkspace: (workspace: Workspace) => void;
  onHelp: (key: HelpKey) => void;
  onToggleHelp: () => void;
  onSave: () => void;
  onLoadFile: (file: File) => void;
  onCheck: () => void;
  onDraftExport: () => void;
  onDismissToast: () => void;
}) => (
  <div className="appShell">
    <header className="topBar">
      <div>
        <p className="eyebrow">Boilerplan AI v2</p>
        <h1>{project.name}</h1>
      </div>
      <div className="statusCluster">
        <ProjectStatusBar readiness={readiness} />
        <button type="button" onClick={onSave}>Сохранить</button>
        <button type="button" onClick={() => fileInputRef.current?.click()}>Загрузить</button>
        <button type="button" onClick={onCheck}>Проверить</button>
        <button type="button" onClick={onDraftExport}>Скачать черновик</button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (file) onLoadFile(file);
            event.currentTarget.value = "";
          }}
        />
        <button
          type="button"
          className={helpMode ? "helpButton active" : "helpButton"}
          onMouseEnter={() => onHelp(workspace)}
          onClick={onToggleHelp}
          aria-pressed={helpMode}
        >
          ?
        </button>
      </div>
    </header>

    {helpMode && <div className="helpBar">{helpText[activeHelp]}</div>}
    {toast && (
      <div className="toastBar">
        <span>{toast}</span>
        <button type="button" onClick={onDismissToast}>Закрыть</button>
      </div>
    )}

    <div className="body">
      <WorkspaceNavigation activeWorkspace={workspace} onWorkspace={onWorkspace} onHelp={onHelp} />
      <main className="workspace">{children}</main>
      {inspector}
    </div>
  </div>
);

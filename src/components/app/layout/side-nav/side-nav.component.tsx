import "@/components/app/application.layout.scss";
import { SingleSidePanel } from "@/components/app/layout/side-nav/format-1/single-side-panel/single-side-panel.component";

export default function SideNavComponent() {

  return (
    <>
      <div className="format-1">
        <SingleSidePanel />
      </div>
    </>
  );
}

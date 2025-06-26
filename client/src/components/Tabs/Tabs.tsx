import "./Tabs.scss";
import React from "react";

interface TabProps {
  value: string;
  children?: React.ReactNode;
  onClick?: (value: string) => void;
  className?: string;
}

interface TabsProps {
  children: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  defaultValue?: string;
  className?: string;
  onChange?: (value: string) => void;
}

const TabsContext = React.createContext<{
  value: string;
  setValue: (value: string) => void;
  onChange?: (value: string) => void;
}>({
  value: "",
  setValue: () => { },
  onChange: undefined,
});

function Tabs({ children, orientation = "horizontal", defaultValue, className, onChange }: TabsProps) {
  const [value, setValue] = React.useState(defaultValue ?? "");

  const handleSetValue = React.useCallback((newValue: string) => {
    setValue(newValue);
    onChange?.(newValue);
  }, [onChange]);

  return (
    <TabsContext.Provider value={{
      value,
      setValue: handleSetValue,
      onChange,
    }}>
      <div className={`${className} toxen-tabs ${orientation ? "toxen-tabs-" + orientation : ""}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

namespace Tabs {
  export function Tab({ value, children, onClick, className = "" }: TabProps) {
    const { value: selectedValue, setValue } = React.useContext(TabsContext);

    return (
      <div
        className={`toxen-tabs-tab
          ${selectedValue === value ? "toxen-tabs-tab-current" : ""} ${className}`}
        onClick={() => {
          setValue(value);
          onClick?.(value);
        }}
        style={{
          color: "green"
        }}
      >
        <div className="toxen-tabs-tab-content">
          {children}
        </div>
      </div>
    );
  }

  export function List(props: {
    children: React.ReactNode,
    justify?: "left" | "center" | "right" | "apart",
    className?: string,
    orientation?: "horizontal" | "vertical",
  }) {
    return (
      <div className={
        "toxen-tabs-list"
        + (props.justify ? " toxen-tabs-list-" + props.justify : "apart")
        + (props.className ? " " + props.className : "")
        + (props.orientation ? " toxen-tabs-list-" + props.orientation : "")
        }>
        {props.children}
      </div>
    );
  }

  export function Panel(props: {
    children: React.ReactNode,
    value: string,
    className?: string,
  }) {
    const { value: selectedValue } = React.useContext(TabsContext);
    
    return (
      <div style={{
        display: selectedValue === props.value ? undefined : "none",
      }} className={"toxen-tabs-panel" + (props.className ? " " + props.className : "")}>
        {props.children}
      </div>
    );
  }
}

export default Tabs;
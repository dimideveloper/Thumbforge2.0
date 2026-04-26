import React from "react";

interface LoaderProps {
  className?: string;
}

const Loader = ({ className = "" }: LoaderProps) => {
  return <div className={`loader ${className}`} />;
};

export default Loader;

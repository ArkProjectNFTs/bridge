"use client";

import { api } from "~/utils/api";
import L1TokenList from "./ui/L1TokenList";
import L2TokenList from "./ui/L2TokenList";

export default function Page() {
  return (
    <div className="flex justify-center space-x-4">
      <div className="w-[360px] rounded-xl border border-gray-100 bg-white p-4">
        <L1TokenList />
      </div>
      <div className="w-[360px] rounded-xl border border-gray-100 bg-white p-4">
        <L2TokenList />
      </div>
    </div>
  );
}

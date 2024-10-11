import { Terminal as XTerm } from "@xterm/xterm";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { FitAddon } from "xterm-addon-fit";
import "@xterm/xterm/css/xterm.css";
import { AttachAddon } from "@xterm/addon-attach";
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label";

interface Props {
	id: string;
	serverId: string;
}

export const Terminal: React.FC<Props> = ({ id, serverId }) => {
	const termRef = useRef(null);
	const [gpuEnabled, setGpuEnabled] = useState(false);

	useEffect(() => {
		const container = document.getElementById(id);
		if (container) {
			container.innerHTML = "";
		}
		const term = new XTerm({
			cursorBlink: true,
			cols: 80,
			rows: 30,
			lineHeight: 1.4,
			convertEol: true,
			theme: {
				cursor: "transparent",
				background: "#19191A",
			},
		});
		const addonFit = new FitAddon();

		const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";

		const wsUrl = `${protocol}//${window.location.host}/terminal?serverId=${serverId}&gpuEnabled=${gpuEnabled}`;

		const ws = new WebSocket(wsUrl);
		const addonAttach = new AttachAddon(ws);

		// @ts-ignore
		term.open(termRef.current);
		term.loadAddon(addonFit);
		term.loadAddon(addonAttach);
		addonFit.fit();
		return () => {
			ws.readyState === WebSocket.OPEN && ws.close();
		};
	}, [id, serverId]);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center space-x-2">
				<Checkbox
					id="enable-gpu"
					checked={gpuEnabled}
					onCheckedChange={(checked) => setGpuEnabled(checked as boolean)}
				/>
				<Label htmlFor="enable-gpu">Enable GPU</Label>
			</div>
			<div className="w-full h-full bg-input rounded-lg p-2 ">
				<div id={id} ref={termRef} className="rounded-xl" />
			</div>
		</div>
	);
};

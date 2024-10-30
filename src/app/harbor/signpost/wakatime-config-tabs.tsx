import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@hackclub/icons";
import { useToast } from "@/hooks/use-toast";

const CopyButton = ({ textToCopy }: { textToCopy: string }) => {
  const { toast } = useToast();

  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    toast({ title: "Copied WakaTime setup script" });
  };

  return (
    <Button className="ml-2 h-auto" onClick={handleCopy}>
      <Icon glyph={isCopied ? "copy-check" : "copy"} size={24} />
    </Button>
  );
};

const WakaTimeConfigTabs = ({ wakaToken }: { wakaToken: string }) => {
  const unixCommand = `echo -e "[settings]\napi_url = https://waka.hackclub.com/api\napi_key = ${wakaToken}" > ~/.wakatime.cfg && echo "WakaTime configuration file has been created/updated at ~/.wakatime.cfg"`;
  const windowsCommand = `echo "[settings]\`napi_url = https://waka.hackclub.com/api\`napi_key = ${wakaToken}" | Out-File -FilePath "$env:USERPROFILE\\.wakatime.cfg" -Encoding ASCII; Write-Host "WakaTime configuration file has been created/updated at $env:USERPROFILE\\.wakatime.cfg"`;

  return (
    <Tabs defaultValue="unix">
      <TabsList>
        <TabsTrigger value="unix">MacOS & Linux</TabsTrigger>
        <TabsTrigger value="windows">Windows</TabsTrigger>
      </TabsList>
      <TabsContent value="unix">
        <Card className="p-2 flex items-stretch">
          <code className="whitespace-nowrap overflow-x-auto flex-grow py-2 pr-2">
            {unixCommand}
          </code>
          <CopyButton textToCopy={unixCommand} />
        </Card>
      </TabsContent>
      <TabsContent value="windows">
        <Card className="p-2 flex items-stretch">
          <code className="whitespace-nowrap overflow-x-auto flex-grow py-2 pr-2">
            {windowsCommand}
          </code>
          <CopyButton textToCopy={windowsCommand} />
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default WakaTimeConfigTabs;

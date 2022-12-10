import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Project } from "../../api/model";
import { loadProject } from "../../api";

const Project = () => {
  const router = useRouter();
  const { id } = router.query;

  const [proj, setProj] = useState<Project>();
  useEffect(() => {
    if (typeof id !== "string") setProj(undefined);
    else (async () => setProj(await loadProject(id)))();
  }, [id]);

  return (
    <div className="max-w-lg m-auto">
      <h1 className="text-2xl font-bold">{id}</h1>
      {proj && proj.ID === id && <Details proj={proj} />}
    </div>
  );
};

function Details({ proj }: { proj: Project }) {
  return (
    <div className="whitespace-pre-wrap">{JSON.stringify(proj, null, 2)}</div>
  );
}

export default Project;

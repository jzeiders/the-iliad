import { NextApiRequest } from "next";

interface IRoutes {
  ProjectTeamSelf: GetRoute & PostRoute;
  ProjectTeamSelfAddPrize: PostRoute;
  ProjectTeamSelfDeletePrize: DeleteRoute;
  ProjectTeamSelfDeleteMember: DeleteRoute;
  ProjectTeamSelfJoin: PutRoute;
}

const Routes: IRoutes = {
  ProjectTeamSelf: "api/projectTeam/self" as Route,
  ProjectTeamSelfAddPrize: "api/projectTeam/self/addPrize" as Route,
  ProjectTeamSelfDeletePrize: "api/projectTeam/self/deletePrize" as Route,
  ProjectTeamSelfDeleteMember: "api/projectTeam/self/deleteMember" as Route,
  ProjectTeamSelfJoin: "api/projectTeam/join" as Route
};

async function processResponse<T>(res: Response): Promise<APIResponse<T>> {
  if (res.status == 400 || res.status == 200) {
    const val = await res.json();
    // JSON will eliminate null key
    if (!("success" in val)) val.success = null;
    return val;
  }
  return { error: "Server Error" };
}

function setupHeaders(req: any, additionalHeaders: HeadersInit): HeadersInit {
  let headers: HeadersInit = {};
  if (req) {
    headers = req.headers;
  }

  return {
    ...headers,
    ...additionalHeaders
  };
}

function computeUrlRoute(route: string, req?: any, param?: ResourceID): string {
  const serverRoute = req
    ? /* Serverside */ process.env.URL_BASE + route
    : /* Client */ "/" + route;

  if (param) {
    return serverRoute + "/" + param;
  }
  return serverRoute;
}

async function APIGet<T>(
  route: GetRoute,
  param?: ResourceID,
  req?: NextApiRequest
): Promise<APIResponse<T>> {
  const urlRoute = computeUrlRoute(route, req, param);
  const headers = setupHeaders(req, {});
  const res = await fetch(urlRoute, {
    headers
  });

  return processResponse(res);
}

async function APIPost<S, T>(
  route: PostRoute,
  body: S,
  req?: NextApiRequest
): Promise<APIResponse<T>> {
  const urlRoute = computeUrlRoute(route, req);
  const headers = setupHeaders(req, { ["Content-Type"]: "application/json" });

  const res = await fetch(urlRoute, {
    method: "POST",
    body: JSON.stringify(body),
    headers
  });

  return processResponse(res);
}

async function APIPut<S, T>(
  route: PutRoute,
  body?: S,
  param?: ResourceID,
  req?: NextApiRequest
): Promise<APIResponse<T>> {
  const urlRoute = computeUrlRoute(route, req, param);
  const headers = setupHeaders(req, { ["Content-Type"]: "application/json" });

  const res = await fetch(urlRoute, {
    method: "PUT",
    body: JSON.stringify(body),
    headers
  });

  return processResponse(res);
}

async function APIDelete<S, T>(
  route: DeleteRoute,
  param?: ResourceID,
  req?: NextApiRequest
): Promise<APIResponse<T>> {
  const urlRoute = computeUrlRoute(route, req, param);
  const headers = setupHeaders(req, { ["Content-Type"]: "application/json" });

  const res = await fetch(urlRoute, {
    method: "DELETE",
    headers
  });

  return processResponse(res);
}

export { APIGet, APIPost, APIPut, APIDelete, Routes };
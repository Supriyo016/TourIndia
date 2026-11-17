"use client";

import { useEffect, useState } from "react";
import { Check, KeyRound, Lock, Plus, Trash2 } from "lucide-react";
import { adminPost } from "./adminFetch";

interface Member {
  userId?: string;
  email: string;
  roles: string[];
  bootstrap: boolean;
  mfa: boolean;
  lastLoginAt?: string;
}
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  builtIn: boolean;
}
interface TeamData {
  team: Member[];
  roles: Role[];
  permissions: Record<string, string>;
  me: string;
}

const when = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Never");

function RolePicker({ roles, chosen, onChange, allowSuper, idPrefix }: { roles: Role[]; chosen: string[]; onChange: (next: string[]) => void; allowSuper: boolean; idPrefix: string }) {
  return (
    <fieldset className="grid gap-1.5 sm:grid-cols-2">
      <legend className="sr-only">Roles</legend>
      {roles
        .filter((role) => allowSuper || role.id !== "super_admin")
        .map((role) => (
          <label key={role.id} htmlFor={`${idPrefix}-${role.id}`} className="flex items-start gap-2 text-sm">
            <input
              id={`${idPrefix}-${role.id}`}
              type="checkbox"
              className="mt-1"
              checked={chosen.includes(role.id)}
              onChange={(event) => onChange(event.target.checked ? [...chosen, role.id] : chosen.filter((id) => id !== role.id))}
            />
            <span>
              <strong>{role.name}</strong>
              <span className="block text-ink-2">{role.description}</span>
            </span>
          </label>
        ))}
    </fieldset>
  );
}

export function AdminTeam({ canEditRoles, isSuperAdmin }: { canEditRoles: boolean; isSuperAdmin: boolean }) {
  const [data, setData] = useState<TeamData | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<{ email: string; roles: string[] } | null>(null);
  const [adding, setAdding] = useState({ email: "", roles: [] as string[] });
  const [roleForm, setRoleForm] = useState<{ id?: string; name: string; description: string; permissions: string[] } | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let alive = true;
    fetch("/api/admin/team", { cache: "no-store" })
      .then(async (response) => {
        const body = (await response.json()) as TeamData & { error?: string };
        if (!response.ok) throw new Error(body.error ?? "Couldn't load the team.");
        if (alive) setData(body);
      })
      .catch((problem: Error) => alive && setError(problem.message));
    return () => {
      alive = false;
    };
  }, [version]);

  const run = async (body: unknown, done: string) => {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await adminPost("/api/admin/team", body);
      setNotice(done);
      setEditing(null);
      setRoleForm(null);
      setVersion((v) => v + 1);
      return true;
    } catch (problem) {
      setError((problem as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  if (!data) return error ? <p role="alert" className="field-error mt-6">{error}</p> : <p className="mt-6 text-ink-2" role="status">Loading…</p>;
  const roleName = (id: string) => data.roles.find((role) => role.id === id)?.name ?? id;

  return (
    <div className="mt-6 grid gap-10">
      <p aria-live="polite" className="sr-only">
        {notice}
      </p>
      {notice && <p className="rounded-[var(--radius-md)] bg-surface-2 p-3 text-sm"><Check className="mr-1 inline size-4" aria-hidden />{notice}</p>}
      {error && <p role="alert" className="field-error">{error}</p>}

      <section aria-labelledby="team-title">
        <h2 id="team-title" className="text-2xl">Admins</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="text-ink-2">
              <tr>
                <th scope="col" className="py-2 pr-4 font-semibold">Address</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Roles</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Authenticator</th>
                <th scope="col" className="py-2 pr-4 font-semibold">Last sign-in</th>
                <th scope="col" className="py-2 font-semibold"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {data.team.map((member) => {
                const locked = member.bootstrap || member.email === data.me;
                return (
                  <tr key={member.email} className="border-t border-line align-top">
                    <td className="py-3 pr-4">
                      {member.email}
                      {member.bootstrap && <span className="block text-xs text-ink-2">Owner (ADMIN_EMAILS)</span>}
                      {member.email === data.me && !member.bootstrap && <span className="block text-xs text-ink-2">You</span>}
                    </td>
                    <td className="py-3 pr-4">
                      {editing?.email === member.email ? (
                        <div className="grid gap-2">
                          <RolePicker roles={data.roles} chosen={editing.roles} onChange={(roles) => setEditing({ ...editing, roles })} allowSuper={isSuperAdmin} idPrefix={`edit-${member.email}`} />
                          <div className="flex gap-2">
                            <button type="button" className="btn btn-primary !min-h-9 text-sm" disabled={busy} onClick={() => run({ action: "set-roles", email: member.email, roles: editing.roles }, `Roles updated for ${member.email}.`)}>
                              Save
                            </button>
                            <button type="button" className="btn btn-outline !min-h-9 text-sm" onClick={() => setEditing(null)}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        member.roles.map(roleName).join(", ")
                      )}
                    </td>
                    <td className="py-3 pr-4">{member.mfa ? <span className="inline-flex items-center gap-1"><KeyRound className="size-4" aria-hidden /> On</span> : "Not set up yet"}</td>
                    <td className="py-3 pr-4 whitespace-nowrap">{when(member.lastLoginAt)}</td>
                    <td className="py-3 text-right whitespace-nowrap">
                      {locked ? (
                        <span className="inline-flex items-center gap-1 text-ink-2" title={member.bootstrap ? "Owner addresses are always Super Admins." : "You can't change your own roles."}>
                          <Lock className="size-4" aria-hidden /> <span className="sr-only">Locked</span>
                        </span>
                      ) : (
                        <span className="inline-flex gap-2">
                          <button type="button" className="btn btn-outline !min-h-9 text-sm" onClick={() => setEditing({ email: member.email, roles: member.roles })}>
                            Change roles
                          </button>
                          <button
                            type="button"
                            className="btn !min-h-9 border border-danger text-sm text-danger"
                            disabled={busy}
                            onClick={() => window.confirm(`Remove admin access for ${member.email}? Their admin sessions end now.`) && run({ action: "set-roles", email: member.email, roles: [] }, `${member.email} is no longer an admin.`)}
                          >
                            Remove
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <form
          className="card mt-6 grid gap-4 p-5"
          onSubmit={async (event) => {
            event.preventDefault();
            if (await run({ action: "set-roles", email: adding.email, roles: adding.roles }, `${adding.email} is now an admin. They'll set up an authenticator at their next admin sign-in.`)) setAdding({ email: "", roles: [] });
          }}
        >
          <h3 className="text-xl">Add an admin</h3>
          <p className="text-sm text-ink-2">They need a Tour India account first: ask them to sign in once with this address.</p>
          <div className="grid gap-1.5">
            <label htmlFor="new-admin-email" className="font-semibold">Email address</label>
            <input id="new-admin-email" type="email" required autoComplete="off" className="input max-w-md" value={adding.email} onChange={(event) => setAdding({ ...adding, email: event.target.value })} />
          </div>
          <RolePicker roles={data.roles} chosen={adding.roles} onChange={(roles) => setAdding({ ...adding, roles })} allowSuper={isSuperAdmin} idPrefix="add" />
          <button className="btn btn-primary justify-self-start" disabled={busy || adding.roles.length === 0}>
            <Plus className="size-4" aria-hidden /> Add admin
          </button>
        </form>
      </section>

      <section aria-labelledby="roles-title">
        <h2 id="roles-title" className="text-2xl">Roles</h2>
        <p className="mt-1 text-ink-2">Built-in roles are fixed. Custom roles can combine any permissions{isSuperAdmin ? "" : " except team, role and restore permissions"}.</p>
        <ul className="mt-4 grid gap-3 lg:grid-cols-2">
          {data.roles.map((role) => (
            <li key={role.id} className="card p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{role.name} {role.builtIn && <span className="ml-1 text-xs font-normal text-ink-2">built-in</span>}</p>
                  <p className="text-sm text-ink-2">{role.description}</p>
                </div>
                {!role.builtIn && canEditRoles && (
                  <span className="flex gap-1.5">
                    <button type="button" className="btn btn-outline !min-h-9 text-sm" onClick={() => setRoleForm({ id: role.id, name: role.name, description: role.description, permissions: role.permissions })}>
                      Edit
                    </button>
                    <button type="button" aria-label={`Delete the ${role.name} role`} className="btn !min-h-9 border border-danger text-danger" disabled={busy} onClick={() => window.confirm(`Delete the ${role.name} role?`) && run({ action: "delete-role", id: role.id }, `${role.name} deleted.`)}>
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </span>
                )}
              </div>
              <details className="mt-2 text-sm">
                <summary className="cursor-pointer text-accent-ink">{role.permissions.length} permissions</summary>
                <ul className="mt-2 list-disc pl-5 text-ink-2">
                  {role.permissions.map((permission) => (
                    <li key={permission}>{data.permissions[permission] ?? permission}</li>
                  ))}
                </ul>
              </details>
            </li>
          ))}
        </ul>

        {canEditRoles &&
          (roleForm ? (
            <form
              className="card mt-6 grid gap-4 p-5"
              onSubmit={(event) => {
                event.preventDefault();
                void run({ action: "save-role", ...roleForm }, `${roleForm.name} saved.`);
              }}
            >
              <h3 className="text-xl">{roleForm.id ? `Edit ${roleForm.name}` : "New role"}</h3>
              <div className="grid gap-1.5">
                <label htmlFor="role-name" className="font-semibold">Name</label>
                <input id="role-name" required minLength={2} maxLength={40} className="input max-w-md" value={roleForm.name} onChange={(event) => setRoleForm({ ...roleForm, name: event.target.value })} />
              </div>
              <div className="grid gap-1.5">
                <label htmlFor="role-description" className="font-semibold">What it&apos;s for</label>
                <input id="role-description" maxLength={200} className="input" value={roleForm.description} onChange={(event) => setRoleForm({ ...roleForm, description: event.target.value })} />
              </div>
              <fieldset className="grid gap-1.5 sm:grid-cols-2">
                <legend className="mb-1 font-semibold">Permissions</legend>
                {Object.entries(data.permissions).map(([id, label]) => {
                  const reserved = ["admins.manage", "roles.manage", "backup.restore"].includes(id) && !isSuperAdmin;
                  return (
                    <label key={id} htmlFor={`perm-${id}`} className={reserved ? "flex items-start gap-2 text-sm text-ink-2" : "flex items-start gap-2 text-sm"}>
                      <input
                        id={`perm-${id}`}
                        type="checkbox"
                        className="mt-1"
                        disabled={reserved}
                        checked={roleForm.permissions.includes(id)}
                        onChange={(event) => setRoleForm({ ...roleForm, permissions: event.target.checked ? [...roleForm.permissions, id] : roleForm.permissions.filter((p) => p !== id) })}
                      />
                      <span>{label}</span>
                    </label>
                  );
                })}
              </fieldset>
              <div className="flex gap-2">
                <button className="btn btn-primary" disabled={busy || roleForm.permissions.length === 0}>Save role</button>
                <button type="button" className="btn btn-outline" onClick={() => setRoleForm(null)}>Cancel</button>
              </div>
            </form>
          ) : (
            <button type="button" className="btn btn-outline mt-6" onClick={() => setRoleForm({ name: "", description: "", permissions: [] })}>
              <Plus className="size-4" aria-hidden /> New role
            </button>
          ))}
      </section>
    </div>
  );
}

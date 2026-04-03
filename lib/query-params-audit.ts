import { supabaseAdmin } from "@/lib/supabase-admin"
import type { QueryParamsMap } from "@/lib/query-params"

type LogQueryParamsAttributionInput = {
  actorId?: string
  pathname: string
  params: QueryParamsMap
  source?: string
}

type LogSmartRedirectInput = {
  actorId?: string
  from: string
  to: string
  params: QueryParamsMap
  reason?: string
}

type LogCampaignConversionInput = {
  actorId?: string
  conversion: string
  pathname: string
  params: QueryParamsMap
  metadata?: Record<string, string | number | boolean | null>
}

async function insertAuditEvent({
  actorId,
  action,
  entity,
  entityId,
  payload,
}: {
  actorId?: string
  action: string
  entity: string
  entityId?: string
  payload: Record<string, unknown>
}) {
  const { error } = await supabaseAdmin.from("audit_logs").insert([
    {
      actor_id: actorId ?? "visitor",
      action,
      entity,
      entity_id: entityId ?? null,
      before_state: null,
      after_state: JSON.stringify(payload),
    },
  ])

  if (error) {
    throw new Error(error.message)
  }
}

export async function logQueryParamsAttribution({
  actorId,
  pathname,
  params,
  source = "landing",
}: LogQueryParamsAttributionInput) {
  await insertAuditEvent({
    actorId,
    action: "query_params_captured",
    entity: "marketing_attribution",
    entityId: pathname,
    payload: { source, pathname, params },
  })
}

export async function logLandingTrafficView({
  actorId,
  pathname,
  params,
  source = "landing",
}: LogQueryParamsAttributionInput) {
  await insertAuditEvent({
    actorId,
    action: "landing_view",
    entity: "traffic",
    entityId: pathname,
    payload: { source, pathname, params },
  })
}

export async function logSmartRedirect({
  actorId,
  from,
  to,
  params,
  reason = "smart-routing",
}: LogSmartRedirectInput) {
  await insertAuditEvent({
    actorId,
    action: "smart_redirect_applied",
    entity: "traffic",
    entityId: from,
    payload: { from, to, reason, params },
  })
}

export async function logCampaignConversion({
  actorId,
  conversion,
  pathname,
  params,
  metadata = {},
}: LogCampaignConversionInput) {
  await insertAuditEvent({
    actorId,
    action: "campaign_conversion_completed",
    entity: conversion,
    entityId: pathname,
    payload: { conversion, pathname, params, metadata },
  })
}
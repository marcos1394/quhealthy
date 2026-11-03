import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

const MCP_DESCRIPTOR = {
  $schema: 'https://modelcontextprotocol.io/schema/server-manifest.json',
  name: 'quhealthy-marketplace-mcp',
  version: '1.0.0',
  description: 'Servidor Oficial MCP de QuHealthy para Marketplace Médico y Agendamiento Clínico en México',
  protocolVersion: '2025-03-26',
  transport: {
    type: 'streamable-http',
    endpoint: 'https://api.quhealthy.org/api/v1/agent-marketplace/mcp',
  },
  capabilities: {
    tools: { listChanged: false },
    resources: { subscribe: false, listChanged: false },
    prompts: { listChanged: false },
  },
  endpoints: {
    mcp: 'https://api.quhealthy.org/api/v1/agent-marketplace/mcp',
    openapi: 'https://api.quhealthy.org/api/v1/agent-marketplace/openapi.json',
    manifest: 'https://api.quhealthy.org/api/v1/agent-marketplace/mcp/manifest',
  },
  compliance: {
    standard: 'NOM-004-SSA3-2012',
    authority: 'COFEPRIS / SEP México',
  },
};

export async function GET() {
  return NextResponse.json(MCP_DESCRIPTOR, {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

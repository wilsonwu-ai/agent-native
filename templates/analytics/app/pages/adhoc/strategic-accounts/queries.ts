/**
 * BigQuery queries for Strategic Accounts dashboard
 */

// Preferred organization IDs for strategic accounts with multiple orgs
const ACCOUNT_ORG_OVERRIDES: Record<string, string> = {
  Netflix: "15e2fce204264ad1a965b13a3a0d2642",
  Amazon: "93f2bbfff4124c19934234944a047f15",
  // Add other accounts as needed
};

/**
 * Get the preferred org ID for an account, if one is mapped
 */
function getPreferredOrgId(accountName: string): string {
  return ACCOUNT_ORG_OVERRIDES[accountName] || "";
}

export function getAccountsOverviewQuery(
  accountNames: string[],
  days: number = 90,
): string {
  const accountsList = accountNames.map((name) => `'${name}'`).join(", ");

  // Build CASE statements for each account with a preferred org ID
  const orgPreferenceCases = accountNames
    .map((name) => {
      const preferredOrgId = getPreferredOrgId(name);
      if (!preferredOrgId) return "";
      return `WHEN company_name = '${name}' AND root_org_id = '${preferredOrgId}' THEN 0`;
    })
    .filter(Boolean)
    .join("\n        ");

  const orderByClause = orgPreferenceCases
    ? `CASE
        ${orgPreferenceCases}
        ELSE 1
      END,
      CAST(current_enterprise_arr AS FLOAT64) DESC NULLS LAST,
      upcoming_renewal_date DESC NULLS LAST`
    : `CAST(current_enterprise_arr AS FLOAT64) DESC NULLS LAST,
      upcoming_renewal_date DESC NULLS LAST`;

  return `
WITH all_matching_companies AS (
  SELECT
    company_id,
    company_name,
    company_domain_name,
    root_org_id,
    current_enterprise_arr,
    upcoming_renewal_date,
    customer_stage,
    hs_csm_sentiment,
    ROW_NUMBER() OVER (
      PARTITION BY company_name
      ORDER BY
        ${orderByClause}
    ) as rn
  FROM \`builder-3b0a2.dbt_staging.hubspot_companies\`
  WHERE company_name IN (${accountsList})
),
strategic_companies AS (
  SELECT
    company_id,
    company_name,
    company_domain_name,
    root_org_id,
    current_enterprise_arr,
    upcoming_renewal_date,
    customer_stage,
    hs_csm_sentiment
  FROM all_matching_companies
  WHERE rn = 1
),
open_deals AS (
  SELECT
    sc.company_name,
    COUNT(DISTINCT d.deal_id) as open_deals_count,
    SUM(d.amount) as open_deals_value
  FROM strategic_companies sc
  LEFT JOIN \`builder-3b0a2.dbt_mart.dim_hs_deals\` d
    ON CAST(sc.company_id AS BIGNUMERIC) = d.company_id
  WHERE d.is_closed_won = FALSE
    AND d.is_deal_closed = FALSE
    AND d.pipeline_name IN ('Enterprise: New Business', 'Enterprise: Expansion', 'Enterprise: Renewal')
    AND DATE(d.close_date) >= CURRENT_DATE()
    AND DATE(d.close_date) <= '2027-01-31'
  GROUP BY sc.company_name
)
SELECT
  sc.company_name,
  sc.current_enterprise_arr as current_arr,
  sc.upcoming_renewal_date as renewal_date,
  CASE 
    WHEN sc.hs_csm_sentiment = 'At Risk' THEN 'at_risk'
    ELSE 'on_track'
  END as renewal_status,
  COALESCE(od.open_deals_count, 0) as open_deals_count,
  COALESCE(od.open_deals_value, 0) as open_deals_value,
  'unknown' as deployment_status,
  'unknown' as expansion_strategy,
  COALESCE(od.open_deals_value, 0) as total_pipeline
FROM strategic_companies sc
LEFT JOIN open_deals od ON sc.company_name = od.company_name
ORDER BY sc.company_name
  `;
}

export function getFusionUsageQuery(
  accountNames: string[],
  days: number = 90,
): string {
  const accountsList = accountNames.map((name) => `'${name}'`).join(", ");

  const orgPreferenceCases = accountNames
    .map((name) => {
      const preferredOrgId = getPreferredOrgId(name);
      if (!preferredOrgId) return "";
      return `WHEN company_name = '${name}' AND root_org_id = '${preferredOrgId}' THEN 0`;
    })
    .filter(Boolean)
    .join("\n        ");

  const orderByClause = orgPreferenceCases
    ? `CASE
        ${orgPreferenceCases}
        ELSE 1
      END,
      CAST(current_enterprise_arr AS FLOAT64) DESC NULLS LAST,
      upcoming_renewal_date DESC NULLS LAST`
    : `CAST(current_enterprise_arr AS FLOAT64) DESC NULLS LAST,
      upcoming_renewal_date DESC NULLS LAST`;

  return `
WITH all_matching_companies AS (
  SELECT
    company_id,
    company_name,
    root_org_id,
    ROW_NUMBER() OVER (
      PARTITION BY company_name
      ORDER BY
        ${orderByClause}
    ) as rn
  FROM \`builder-3b0a2.dbt_staging.hubspot_companies\`
  WHERE company_name IN (${accountsList})
),
strategic_companies AS (
  SELECT
    company_id,
    company_name,
    root_org_id
  FROM all_matching_companies
  WHERE rn = 1
),
company_users AS (
  SELECT DISTINCT
    sc.company_name,
    sc.root_org_id,
    c.builder_user_id,
    c.email
  FROM strategic_companies sc
  LEFT JOIN \`builder-3b0a2.dbt_mart.dim_hs_contacts\` c
    ON CAST(sc.company_id AS INT64) = c.company_id
  WHERE c.builder_user_id IS NOT NULL
    AND c.email NOT LIKE '%@builder.io'
),
signups AS (
  SELECT DISTINCT
    cu.company_name,
    s.root_organization_id
  FROM company_users cu
  JOIN \`builder-3b0a2.dbt_staging_bigquery.signups\` s
    ON cu.builder_user_id = s.user_id
),
fusion_events AS (
  SELECT
    s.company_name,
    JSON_VALUE(e.event_properties, '$.userId') as user_id,
    COUNT(*) as message_count
  FROM \`builder-3b0a2.amplitude.EVENTS_182198\` e
  JOIN signups s
    ON JSON_VALUE(e.event_properties, '$.rootOrganizationId') = s.root_organization_id
  WHERE e.event_type = 'fusion chat message submitted'
    AND DATE(e.event_time) >= DATE_SUB(CURRENT_DATE(), INTERVAL ${days} DAY)
    AND DATE(e.event_time) <= CURRENT_DATE()
  GROUP BY s.company_name, user_id
)
SELECT
  sc.company_name,
  COUNT(DISTINCT fe.user_id) as unique_users,
  COALESCE(SUM(fe.message_count), 0) as total_messages
FROM strategic_companies sc
LEFT JOIN fusion_events fe ON sc.company_name = fe.company_name
GROUP BY sc.company_name
ORDER BY unique_users DESC, total_messages DESC
  `;
}

export function getAccountDetailQuery(
  accountName: string,
  dateStart: string,
  dateEnd: string,
): string {
  const preferredOrgId = getPreferredOrgId(accountName);
  const orderByClause = preferredOrgId
    ? `CASE WHEN root_org_id = '${preferredOrgId}' THEN 0 ELSE 1 END,
    CAST(current_enterprise_arr AS FLOAT64) DESC NULLS LAST,
    upcoming_renewal_date DESC NULLS LAST`
    : `CAST(current_enterprise_arr AS FLOAT64) DESC NULLS LAST,
    upcoming_renewal_date DESC NULLS LAST`;

  return `
WITH company_info AS (
  SELECT
    company_id,
    company_name,
    company_domain_name,
    root_org_id,
    current_enterprise_arr,
    upcoming_renewal_date,
    customer_stage,
    hs_csm_sentiment,
    company_owner_name,
    customer_segmentation,
    csm_owner_name as customer_success_manager,
    customer_engineering_owner_name as customer_engineer,
    CAST(NULL AS STRING) as assigned_engineer
  FROM \`builder-3b0a2.dbt_staging.hubspot_companies\`
  WHERE company_name = '${accountName}'
  ORDER BY
    ${orderByClause}
  LIMIT 1
),
contacts AS (
  SELECT
    c.email,
    c.firstname,
    c.lastname,
    c.builder_user_id,
    c.lifecycle_stage_name,
    c.hubspotscore as ql_score
  FROM company_info ci
  JOIN \`builder-3b0a2.dbt_mart.dim_hs_contacts\` c
    ON CAST(ci.company_id AS INT64) = c.company_id
  WHERE c.email NOT LIKE '%@builder.io'
),
deals AS (
  SELECT
    d.deal_id,
    d.amount,
    d.stage_name,
    d.close_date,
    d.is_closed_won
  FROM company_info ci
  JOIN \`builder-3b0a2.dbt_mart.dim_deals\` d
    ON CAST(ci.company_id AS STRING) = CAST(d.primary_associated_company AS STRING)
  WHERE d.is_closed_won = 'false'
    AND d.stage_name NOT LIKE '%Closed%Lost%'
)
SELECT
  ci.company_id,
  ci.company_name,
  ci.company_domain_name,
  ci.current_enterprise_arr,
  ci.upcoming_renewal_date,
  ci.customer_stage,
  ci.hs_csm_sentiment,
  ci.company_owner_name,
  ci.customer_segmentation,
  ci.customer_success_manager,
  ci.customer_engineer,
  ci.assigned_engineer,
  COUNT(DISTINCT c.email) as total_contacts,
  COUNT(DISTINCT c.builder_user_id) as builder_users,
  COUNT(DISTINCT d.deal_id) as open_deals,
  SUM(d.amount) as total_pipeline
FROM company_info ci
LEFT JOIN contacts c ON TRUE
LEFT JOIN deals d ON TRUE
GROUP BY
  ci.company_id,
  ci.company_name,
  ci.company_domain_name,
  ci.current_enterprise_arr,
  ci.upcoming_renewal_date,
  ci.customer_stage,
  ci.hs_csm_sentiment,
  ci.company_owner_name,
  ci.customer_segmentation,
  ci.customer_success_manager,
  ci.customer_engineer,
  ci.assigned_engineer
  `;
}

export function getAccountFusionTimeSeriesQuery(
  accountName: string,
  dateStart: string,
  dateEnd: string,
): string {
  const preferredOrgId = getPreferredOrgId(accountName);
  const orderByClause = preferredOrgId
    ? `CASE WHEN root_org_id = '${preferredOrgId}' THEN 0 ELSE 1 END,
    CAST(current_enterprise_arr AS FLOAT64) DESC NULLS LAST,
    upcoming_renewal_date DESC NULLS LAST`
    : `CAST(current_enterprise_arr AS FLOAT64) DESC NULLS LAST,
    upcoming_renewal_date DESC NULLS LAST`;

  return `
WITH company_info AS (
  SELECT
    company_id,
    company_name,
    root_org_id
  FROM \`builder-3b0a2.dbt_staging.hubspot_companies\`
  WHERE company_name = '${accountName}'
  ORDER BY
    ${orderByClause}
  LIMIT 1
),
company_users AS (
  SELECT DISTINCT
    c.builder_user_id,
    c.email
  FROM company_info ci
  LEFT JOIN \`builder-3b0a2.dbt_mart.dim_hs_contacts\` c
    ON CAST(ci.company_id AS INT64) = c.company_id
  WHERE c.builder_user_id IS NOT NULL
    AND c.email NOT LIKE '%@builder.io'
),
signups AS (
  SELECT DISTINCT
    s.root_organization_id
  FROM company_users cu
  JOIN \`builder-3b0a2.dbt_staging_bigquery.signups\` s
    ON cu.builder_user_id = s.user_id
)
SELECT
  DATE(e.event_time) as date,
  COUNT(*) as messages,
  COUNT(DISTINCT JSON_VALUE(e.event_properties, '$.userId')) as active_users
FROM \`builder-3b0a2.amplitude.EVENTS_182198\` e
JOIN signups s
  ON JSON_VALUE(e.event_properties, '$.rootOrganizationId') = s.root_organization_id
WHERE e.event_type = 'fusion chat message submitted'
  AND DATE(e.event_time) >= DATE('${dateStart}')
  AND DATE(e.event_time) <= DATE('${dateEnd}')
GROUP BY date
ORDER BY date
  `;
}

export function getAccountUsersQuery(
  accountName: string,
  dateStart: string,
  dateEnd: string,
): string {
  const preferredOrgId = getPreferredOrgId(accountName);
  const orderByClause = preferredOrgId
    ? `CASE WHEN root_org_id = '${preferredOrgId}' THEN 0 ELSE 1 END,
    CAST(current_enterprise_arr AS FLOAT64) DESC NULLS LAST,
    upcoming_renewal_date DESC NULLS LAST`
    : `CAST(current_enterprise_arr AS FLOAT64) DESC NULLS LAST,
    upcoming_renewal_date DESC NULLS LAST`;

  return `
WITH company_info AS (
  SELECT
    company_id,
    company_name,
    root_org_id
  FROM \`builder-3b0a2.dbt_staging.hubspot_companies\`
  WHERE company_name = '${accountName}'
  ORDER BY
    ${orderByClause}
  LIMIT 1
),
company_users AS (
  SELECT DISTINCT
    c.builder_user_id,
    c.email,
    c.firstname,
    c.lastname,
    c.lifecycle_stage_name,
    c.jobtitle
  FROM company_info ci
  LEFT JOIN \`builder-3b0a2.dbt_mart.dim_hs_contacts\` c
    ON CAST(ci.company_id AS INT64) = c.company_id
  WHERE c.builder_user_id IS NOT NULL
    AND c.email NOT LIKE '%@builder.io'
),
signups AS (
  SELECT DISTINCT
    cu.email,
    cu.firstname,
    cu.lastname,
    cu.lifecycle_stage_name,
    cu.jobtitle,
    s.root_organization_id
  FROM company_users cu
  JOIN \`builder-3b0a2.dbt_staging_bigquery.signups\` s
    ON cu.builder_user_id = s.user_id
),
fusion_activity AS (
  SELECT
    JSON_VALUE(e.event_properties, '$.userId') as user_id,
    COUNT(*) as message_count,
    MIN(DATE(e.event_time)) as first_activity,
    MAX(DATE(e.event_time)) as last_activity
  FROM \`builder-3b0a2.amplitude.EVENTS_182198\` e
  JOIN signups s
    ON JSON_VALUE(e.event_properties, '$.rootOrganizationId') = s.root_organization_id
  WHERE e.event_type = 'fusion chat message submitted'
    AND DATE(e.event_time) >= DATE('${dateStart}')
    AND DATE(e.event_time) <= DATE('${dateEnd}')
  GROUP BY user_id
)
SELECT
  s.email,
  CONCAT(COALESCE(s.firstname, ''), ' ', COALESCE(s.lastname, '')) as name,
  s.lifecycle_stage_name,
  s.jobtitle,
  COALESCE(fa.message_count, 0) as fusion_messages,
  fa.first_activity,
  fa.last_activity
FROM signups s
LEFT JOIN fusion_activity fa
  ON s.root_organization_id = JSON_VALUE(CAST(fa.user_id AS STRING), '$')
ORDER BY fusion_messages DESC, s.email
  `;
}

export function getAccountUserPersonasQuery(
  accountName: string,
  dateStart: string,
  dateEnd: string,
): string {
  const preferredOrgId = getPreferredOrgId(accountName);
  const orderByClause = preferredOrgId
    ? `CASE WHEN root_org_id = '${preferredOrgId}' THEN 0 ELSE 1 END,
    CAST(current_enterprise_arr AS FLOAT64) DESC NULLS LAST,
    upcoming_renewal_date DESC NULLS LAST`
    : `CAST(current_enterprise_arr AS FLOAT64) DESC NULLS LAST,
    upcoming_renewal_date DESC NULLS LAST`;

  return `
WITH company_info AS (
  SELECT
    company_id,
    company_name,
    root_org_id
  FROM \`builder-3b0a2.dbt_staging.hubspot_companies\`
  WHERE company_name = '${accountName}'
  ORDER BY
    ${orderByClause}
  LIMIT 1
),
company_users AS (
  SELECT DISTINCT
    c.builder_user_id,
    c.email,
    c.jobtitle
  FROM company_info ci
  LEFT JOIN \`builder-3b0a2.dbt_mart.dim_hs_contacts\` c
    ON CAST(ci.company_id AS INT64) = c.company_id
  WHERE c.builder_user_id IS NOT NULL
    AND c.email NOT LIKE '%@builder.io'
),
signups AS (
  SELECT DISTINCT
    cu.email,
    cu.jobtitle,
    s.root_organization_id
  FROM company_users cu
  JOIN \`builder-3b0a2.dbt_staging_bigquery.signups\` s
    ON cu.builder_user_id = s.user_id
),
fusion_users AS (
  SELECT DISTINCT
    JSON_VALUE(e.event_properties, '$.userId') as user_id,
    JSON_VALUE(e.event_properties, '$.rootOrganizationId') as root_org_id
  FROM \`builder-3b0a2.amplitude.EVENTS_182198\` e
  JOIN signups s
    ON JSON_VALUE(e.event_properties, '$.rootOrganizationId') = s.root_organization_id
  WHERE e.event_type = 'fusion chat message submitted'
    AND DATE(e.event_time) >= DATE('${dateStart}')
    AND DATE(e.event_time) <= DATE('${dateEnd}')
),
users_with_titles AS (
  SELECT
    s.email,
    LOWER(COALESCE(s.jobtitle, '')) as jobtitle_lower
  FROM signups s
  INNER JOIN fusion_users fu
    ON s.root_organization_id = fu.root_org_id
),
categorized AS (
  SELECT
    CASE
      WHEN jobtitle_lower LIKE '%engineer%' THEN 'Developer/Engineering'
      WHEN jobtitle_lower LIKE '%developer%' THEN 'Developer/Engineering'
      WHEN jobtitle_lower LIKE '%software%' THEN 'Developer/Engineering'
      WHEN jobtitle_lower LIKE '%programmer%' THEN 'Developer/Engineering'
      WHEN jobtitle_lower LIKE '%architect%' THEN 'Developer/Engineering'
      WHEN jobtitle_lower LIKE '%dev %' THEN 'Developer/Engineering'
      WHEN jobtitle_lower LIKE '% sde%' THEN 'Developer/Engineering'
      WHEN jobtitle_lower LIKE '%full stack%' THEN 'Developer/Engineering'
      WHEN jobtitle_lower LIKE '%frontend%' THEN 'Developer/Engineering'
      WHEN jobtitle_lower LIKE '%backend%' THEN 'Developer/Engineering'
      WHEN jobtitle_lower LIKE '%tech lead%' THEN 'Developer/Engineering'
      WHEN jobtitle_lower LIKE '%technical%' THEN 'Developer/Engineering'
      WHEN jobtitle_lower LIKE '%design%' THEN 'Design'
      WHEN jobtitle_lower LIKE '%ux%' THEN 'Design'
      WHEN jobtitle_lower LIKE '%ui%' THEN 'Design'
      WHEN jobtitle_lower LIKE '%creative%' THEN 'Design'
      WHEN jobtitle_lower LIKE '%product%' THEN 'Product'
      WHEN jobtitle_lower LIKE '%pm%' THEN 'Product'
      WHEN jobtitle_lower LIKE '%product manager%' THEN 'Product'
      WHEN jobtitle_lower LIKE '%product owner%' THEN 'Product'
      ELSE 'Other'
    END as persona
  FROM users_with_titles
  WHERE jobtitle_lower != ''
)
SELECT
  persona,
  COUNT(*) as user_count
FROM categorized
GROUP BY persona
ORDER BY user_count DESC
  `;
}

export function getAccountCreditsTimeSeriesQuery(
  accountName: string,
  dateStart: string,
  dateEnd: string,
): string {
  const preferredOrgId = getPreferredOrgId(accountName);
  const orderByClause = preferredOrgId
    ? `CASE WHEN root_org_id = '${preferredOrgId}' THEN 0 ELSE 1 END,
    CAST(current_enterprise_arr AS FLOAT64) DESC NULLS LAST,
    upcoming_renewal_date DESC NULLS LAST`
    : `CAST(current_enterprise_arr AS FLOAT64) DESC NULLS LAST,
    upcoming_renewal_date DESC NULLS LAST`;

  return `
WITH company_info AS (
  SELECT
    company_id,
    company_name,
    root_org_id
  FROM \`builder-3b0a2.dbt_staging.hubspot_companies\`
  WHERE company_name = '${accountName}'
  ORDER BY
    ${orderByClause}
  LIMIT 1
),
company_users AS (
  SELECT DISTINCT
    c.builder_user_id,
    c.email
  FROM company_info ci
  LEFT JOIN \`builder-3b0a2.dbt_mart.dim_hs_contacts\` c
    ON CAST(ci.company_id AS INT64) = c.company_id
  WHERE c.builder_user_id IS NOT NULL
    AND c.email NOT LIKE '%@builder.io'
)
SELECT
  DATE(timestamp) as period,
  SUM(COALESCE(credits_used, 0)) as credits_consumed
FROM \`builder-3b0a2.logs.ai_credits_usage\`
WHERE user_id IN (SELECT builder_user_id FROM company_users)
  AND DATE(timestamp) >= DATE('${dateStart}')
  AND DATE(timestamp) <= DATE('${dateEnd}')
  AND LOWER(COALESCE(source, '')) NOT IN ('rollover', 'vcpeditorai', 'gendesign')
GROUP BY period
ORDER BY period
  `;
}

export function getAccountWeeklyActiveUsersQuery(
  accountName: string,
  dateStart: string,
  dateEnd: string,
): string {
  const preferredOrgId = getPreferredOrgId(accountName);
  const orderByClause = preferredOrgId
    ? `CASE WHEN root_org_id = '${preferredOrgId}' THEN 0 ELSE 1 END,
    CAST(current_enterprise_arr AS FLOAT64) DESC NULLS LAST,
    upcoming_renewal_date DESC NULLS LAST`
    : `CAST(current_enterprise_arr AS FLOAT64) DESC NULLS LAST,
    upcoming_renewal_date DESC NULLS LAST`;

  return `
WITH company_info AS (
  SELECT
    company_id,
    company_name,
    root_org_id
  FROM \`builder-3b0a2.dbt_staging.hubspot_companies\`
  WHERE company_name = '${accountName}'
  ORDER BY
    ${orderByClause}
  LIMIT 1
),
company_users AS (
  SELECT DISTINCT
    c.builder_user_id,
    c.email
  FROM company_info ci
  LEFT JOIN \`builder-3b0a2.dbt_mart.dim_hs_contacts\` c
    ON CAST(ci.company_id AS INT64) = c.company_id
  WHERE c.builder_user_id IS NOT NULL
    AND c.email NOT LIKE '%@builder.io'
),
signups AS (
  SELECT DISTINCT
    s.root_organization_id
  FROM company_users cu
  JOIN \`builder-3b0a2.dbt_staging_bigquery.signups\` s
    ON cu.builder_user_id = s.user_id
)
SELECT
  DATE_TRUNC(DATE(e.event_time), WEEK(MONDAY)) as period,
  COUNT(DISTINCT JSON_VALUE(e.event_properties, '$.userId')) as active_users
FROM \`builder-3b0a2.amplitude.EVENTS_182198\` e
JOIN signups s
  ON JSON_VALUE(e.event_properties, '$.rootOrganizationId') = s.root_organization_id
WHERE e.event_type = 'fusion chat message submitted'
  AND DATE(e.event_time) >= DATE('${dateStart}')
  AND DATE(e.event_time) <= DATE('${dateEnd}')
GROUP BY period
ORDER BY period
  `;
}

export function getAccount30DayActiveUsersQuery(accountName: string): string {
  const preferredOrgId = getPreferredOrgId(accountName);
  const orderByClause = preferredOrgId
    ? `CASE WHEN root_org_id = '${preferredOrgId}' THEN 0 ELSE 1 END,
    CAST(current_enterprise_arr AS FLOAT64) DESC NULLS LAST,
    upcoming_renewal_date DESC NULLS LAST`
    : `CAST(current_enterprise_arr AS FLOAT64) DESC NULLS LAST,
    upcoming_renewal_date DESC NULLS LAST`;

  return `
WITH company_info AS (
  SELECT
    company_id,
    company_name,
    root_org_id
  FROM \`builder-3b0a2.dbt_staging.hubspot_companies\`
  WHERE company_name = '${accountName}'
  ORDER BY
    ${orderByClause}
  LIMIT 1
),
company_users AS (
  SELECT DISTINCT
    c.builder_user_id,
    c.email
  FROM company_info ci
  LEFT JOIN \`builder-3b0a2.dbt_mart.dim_hs_contacts\` c
    ON CAST(ci.company_id AS INT64) = c.company_id
  WHERE c.builder_user_id IS NOT NULL
    AND c.email NOT LIKE '%@builder.io'
),
signups AS (
  SELECT DISTINCT
    s.root_organization_id
  FROM company_users cu
  JOIN \`builder-3b0a2.dbt_staging_bigquery.signups\` s
    ON cu.builder_user_id = s.user_id
)
SELECT
  COUNT(DISTINCT JSON_VALUE(e.event_properties, '$.userId')) as active_users_30d
FROM \`builder-3b0a2.amplitude.EVENTS_182198\` e
JOIN signups s
  ON JSON_VALUE(e.event_properties, '$.rootOrganizationId') = s.root_organization_id
WHERE e.event_type = 'fusion chat message submitted'
  AND DATE(e.event_time) >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
  AND DATE(e.event_time) <= CURRENT_DATE()
  `;
}

export function getAccountUserEngagementQuery(
  accountName: string,
  days: number = 90,
): string {
  const preferredOrgId = getPreferredOrgId(accountName);
  const orderByClause = preferredOrgId
    ? `CASE WHEN root_org_id = '${preferredOrgId}' THEN 0 ELSE 1 END,
    CAST(current_enterprise_arr AS FLOAT64) DESC NULLS LAST,
    upcoming_renewal_date DESC NULLS LAST`
    : `CAST(current_enterprise_arr AS FLOAT64) DESC NULLS LAST,
    upcoming_renewal_date DESC NULLS LAST`;

  return `
WITH company_info AS (
  SELECT company_id, root_org_id
  FROM \`builder-3b0a2.dbt_staging.hubspot_companies\`
  WHERE company_name = '${accountName}'
  ORDER BY ${orderByClause}
  LIMIT 1
),
company_users AS (
  SELECT DISTINCT c.builder_user_id, c.email
  FROM company_info ci
  LEFT JOIN \`builder-3b0a2.dbt_mart.dim_hs_contacts\` c
    ON CAST(ci.company_id AS INT64) = c.company_id
  WHERE c.builder_user_id IS NOT NULL AND c.email NOT LIKE '%@builder.io'
),
signups AS (
  SELECT DISTINCT s.root_organization_id
  FROM company_users cu
  JOIN \`builder-3b0a2.dbt_staging_bigquery.signups\` s
    ON cu.builder_user_id = s.user_id
),
user_activity AS (
  SELECT
    JSON_VALUE(e.event_properties, "$.userId") as user_id,
    JSON_VALUE(e.user_properties, "$.email") as user_email,
    COUNT(*) as total_events,
    MAX(e.event_time) as last_activity,
    MIN(e.event_time) as first_activity,
    COUNTIF(e.event_type = "fusion chat message submitted") as chat_messages,
    COUNTIF(e.event_type = "fusion apply code") as code_applications,
    COUNTIF(e.event_type LIKE "%error%") as error_events,
    COUNTIF(e.event_type = "fusion session start") as sessions
  FROM \`builder-3b0a2.amplitude.EVENTS_182198\` e
  JOIN signups s
    ON JSON_VALUE(e.event_properties, "$.rootOrganizationId") = s.root_organization_id
  WHERE e.event_time >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL ${days} DAY)
    AND e.event_time <= CURRENT_TIMESTAMP()
    AND e.event_type LIKE "fusion%"
  GROUP BY user_id, user_email
)
SELECT
  user_email,
  total_events,
  chat_messages,
  code_applications,
  sessions,
  error_events,
  last_activity,
  first_activity,
  DATE_DIFF(CURRENT_DATE(), DATE(last_activity), DAY) as days_since_last_activity,
  DATE_DIFF(DATE(last_activity), DATE(first_activity), DAY) as days_active_span
FROM user_activity
WHERE user_id IS NOT NULL AND user_email IS NOT NULL
ORDER BY chat_messages DESC
  `;
}

export function getAccountDailyActivityQuery(
  accountName: string,
  days: number = 90,
): string {
  const preferredOrgId = getPreferredOrgId(accountName);
  const orderByClause = preferredOrgId
    ? `CASE WHEN root_org_id = '${preferredOrgId}' THEN 0 ELSE 1 END,
    CAST(current_enterprise_arr AS FLOAT64) DESC NULLS LAST,
    upcoming_renewal_date DESC NULLS LAST`
    : `CAST(current_enterprise_arr AS FLOAT64) DESC NULLS LAST,
    upcoming_renewal_date DESC NULLS LAST`;

  return `
WITH company_info AS (
  SELECT company_id, root_org_id
  FROM \`builder-3b0a2.dbt_staging.hubspot_companies\`
  WHERE company_name = '${accountName}'
  ORDER BY ${orderByClause}
  LIMIT 1
),
company_users AS (
  SELECT DISTINCT c.builder_user_id
  FROM company_info ci
  LEFT JOIN \`builder-3b0a2.dbt_mart.dim_hs_contacts\` c
    ON CAST(ci.company_id AS INT64) = c.company_id
  WHERE c.builder_user_id IS NOT NULL AND c.email NOT LIKE '%@builder.io'
),
signups AS (
  SELECT DISTINCT s.root_organization_id
  FROM company_users cu
  JOIN \`builder-3b0a2.dbt_staging_bigquery.signups\` s
    ON cu.builder_user_id = s.user_id
)
SELECT
  DATE(e.event_time) as date,
  COUNT(DISTINCT JSON_VALUE(e.event_properties, "$.userId")) as active_users,
  COUNT(*) as total_events,
  COUNTIF(e.event_type = "fusion chat message submitted") as chat_messages,
  COUNTIF(e.event_type = "fusion apply code") as code_applications
FROM \`builder-3b0a2.amplitude.EVENTS_182198\` e
JOIN signups s
  ON JSON_VALUE(e.event_properties, "$.rootOrganizationId") = s.root_organization_id
WHERE e.event_time >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL ${days} DAY)
  AND e.event_time <= CURRENT_TIMESTAMP()
  AND e.event_type LIKE "fusion%"
GROUP BY date
ORDER BY date ASC
  `;
}

export function getAccountCreditUtilizationQuery(accountName: string): string {
  const preferredOrgId = getPreferredOrgId(accountName);
  const orderByClause = preferredOrgId
    ? `CASE WHEN root_org_id = '${preferredOrgId}' THEN 0 ELSE 1 END,
    CAST(current_enterprise_arr AS FLOAT64) DESC NULLS LAST,
    upcoming_renewal_date DESC NULLS LAST`
    : `CAST(current_enterprise_arr AS FLOAT64) DESC NULLS LAST,
    upcoming_renewal_date DESC NULLS LAST`;

  return `
WITH company_info AS (
  SELECT
    company_id,
    company_name,
    root_org_id
  FROM \`builder-3b0a2.dbt_staging.hubspot_companies\`
  WHERE company_name = '${accountName}'
  ORDER BY
    ${orderByClause}
  LIMIT 1
),
company_users AS (
  SELECT DISTINCT
    c.builder_user_id,
    c.email
  FROM company_info ci
  LEFT JOIN \`builder-3b0a2.dbt_mart.dim_hs_contacts\` c
    ON CAST(ci.company_id AS INT64) = c.company_id
  WHERE c.builder_user_id IS NOT NULL
    AND c.email NOT LIKE '%@builder.io'
),
last_month_credits AS (
  SELECT
    SUM(COALESCE(credits_used, 0)) as credits_last_month
  FROM \`builder-3b0a2.logs.ai_credits_usage\`
  WHERE user_id IN (SELECT builder_user_id FROM company_users)
    AND DATE(timestamp) >= DATE_TRUNC(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH), MONTH)
    AND DATE(timestamp) < DATE_TRUNC(CURRENT_DATE(), MONTH)
    AND LOWER(COALESCE(source, '')) NOT IN ('rollover', 'vcpeditorai', 'gendesign')
),
mtd_credits AS (
  SELECT
    SUM(COALESCE(credits_used, 0)) as credits_mtd
  FROM \`builder-3b0a2.logs.ai_credits_usage\`
  WHERE user_id IN (SELECT builder_user_id FROM company_users)
    AND DATE(timestamp) >= DATE_TRUNC(CURRENT_DATE(), MONTH)
    AND DATE(timestamp) <= CURRENT_DATE()
    AND LOWER(COALESCE(source, '')) NOT IN ('rollover', 'vcpeditorai', 'gendesign')
)
SELECT
  COALESCE((SELECT credits_last_month FROM last_month_credits), 0) as last_month_credits,
  COALESCE((SELECT credits_mtd FROM mtd_credits), 0) as mtd_credits
  `;
}

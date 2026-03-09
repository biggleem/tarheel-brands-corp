-- =============================================================================
-- Tarheel Brands Corporation Manager - Seed Data
-- =============================================================================
-- Inserts the full organization hierarchy, all businesses, default chart of
-- accounts template, and default document types.
-- =============================================================================

BEGIN;

-- =============================================================================
-- 1. ORGANIZATION HIERARCHY
-- =============================================================================
-- Level 1: South Armz Global Inc (holding)
-- Level 2: Tarheel Brands (operating)
-- Level 3: All individual businesses
-- =============================================================================

DO $$
DECLARE
  v_holding_id   uuid := gen_random_uuid();
  v_operating_id uuid := gen_random_uuid();
  v_org_id       uuid;
BEGIN

  -- -------------------------------------------------------------------------
  -- Level 1: Holding Company
  -- -------------------------------------------------------------------------
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (
    v_holding_id,
    NULL,
    'South Armz Global Inc',
    'south-armz-global',
    'holding',
    'Pittsboro',
    'NC',
    'active',
    '{}'::jsonb
  );

  -- -------------------------------------------------------------------------
  -- Level 2: Operating Company
  -- -------------------------------------------------------------------------
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (
    v_operating_id,
    v_holding_id,
    'Tarheel Brands',
    'tarheel-brands',
    'operating',
    'Pittsboro',
    'NC',
    'active',
    '{}'::jsonb
  );

  -- =========================================================================
  -- Level 3: Individual Businesses
  -- =========================================================================

  -- -----------------------------------------------------------------------
  -- FOOD & BEVERAGE
  -- -----------------------------------------------------------------------

  -- Koshu Sake Bar
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Koshu Sake Bar', 'koshu-sake-bar', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'food_beverage', 'koshusakebar.com', 'active', true, false, '{"alternate_domains": ["koshuagedsake.com"]}'::jsonb);

  -- Southern Sours
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Southern Sours', 'southern-sours', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'food_beverage', 'southernsours.com', 'active', false, true, '{"alternate_domains": ["trapsour.com", "trapsours.com"]}'::jsonb);

  -- Carolina Canna Bar
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Carolina Canna Bar', 'carolina-canna-bar', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'food_beverage', 'carolinacannabar.com', 'active', true, false, '{"alternate_domains": ["nccannabar.com"]}'::jsonb);

  -- Metal Brixx Cafe
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Metal Brixx Cafe', 'metal-brixx-cafe', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'food_beverage', 'metalbrixxcafe.com', 'active', true, false, '{"alternate_domains": ["metalbrixx.com"]}'::jsonb);

  -- Hempy Java
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Hempy Java', 'hempy-java', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'food_beverage', 'hempyjava.com', 'active', false, true, '{}'::jsonb);

  -- African Coffee Reserve
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'African Coffee Reserve', 'african-coffee-reserve', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'food_beverage', 'africancoffeereserve.com', 'active', false, true, '{}'::jsonb);

  -- Sour Gang
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Sour Gang', 'sour-gang', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'food_beverage', 'sourgang.com', 'active', false, true, '{}'::jsonb);

  -- -----------------------------------------------------------------------
  -- HEALTH & FITNESS
  -- -----------------------------------------------------------------------

  -- Axercise Nation
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Axercise Nation', 'axercise-nation', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'health_fitness', 'axercisenation.com', 'active', false, true, '{}'::jsonb);

  -- Helpdesk Fitness
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Helpdesk Fitness', 'helpdesk-fitness', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'health_fitness', 'helpdeskfitness.com', 'active', false, true, '{"alternate_domains": ["helpdeskhealth.com"]}'::jsonb);

  -- On Track Wellness NC
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'On Track Wellness NC', 'on-track-wellness-nc', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'health_fitness', 'ontrackwellnessnc.com', 'active', false, false, '{}'::jsonb);

  -- NC Peer Support
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'NC Peer Support', 'nc-peer-support', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'health_fitness', 'ncpeersupport.com', 'active', false, false, '{}'::jsonb);

  -- -----------------------------------------------------------------------
  -- TECH & BLOCKCHAIN
  -- -----------------------------------------------------------------------

  -- DefiCodeCamp
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'DefiCodeCamp', 'defi-code-camp', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tech_blockchain', 'deficodecamp.com', 'active', false, false, '{"alternate_domains": ["deficodecamp.org"]}'::jsonb);

  -- 1NC Blockchain
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, '1NC Blockchain', '1nc-blockchain', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tech_blockchain', '1ncblockchain.com', 'active', false, false, '{}'::jsonb);

  -- Asheville Blockchain
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Asheville Blockchain', 'asheville-blockchain', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tech_blockchain', 'ashevilleblockchain.com', 'active', false, false, '{}'::jsonb);

  -- Durham Blockchain
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Durham Blockchain', 'durham-blockchain', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tech_blockchain', 'durhamblockchain.com', 'active', false, false, '{}'::jsonb);

  -- Fayetteville Blockchain
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Fayetteville Blockchain', 'fayetteville-blockchain', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tech_blockchain', 'fayettevilleblockchain.com', 'active', false, false, '{}'::jsonb);

  -- Greensboro Blockchain
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Greensboro Blockchain', 'greensboro-blockchain', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tech_blockchain', 'greensboroblockchain.com', 'active', false, false, '{}'::jsonb);

  -- Raleigh Blockchain
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Raleigh Blockchain', 'raleigh-blockchain', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tech_blockchain', 'raleighblockchain.com', 'active', false, false, '{}'::jsonb);

  -- Triangle Blockchain
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Triangle Blockchain', 'triangle-blockchain', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tech_blockchain', 'triangleblockchain.com', 'active', false, false, '{}'::jsonb);

  -- Wilmington Blockchain
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Wilmington Blockchain', 'wilmington-blockchain', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tech_blockchain', 'wilmingtonblockchain.com', 'active', false, false, '{}'::jsonb);

  -- Charlotte Blockchain
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Charlotte Blockchain', 'charlotte-blockchain', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tech_blockchain', 'charlotteblockchain.com', 'active', false, false, '{}'::jsonb);

  -- Atlanta Blockchain
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Atlanta Blockchain', 'atlanta-blockchain', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tech_blockchain', 'atlantablockchain.net', 'active', false, false, '{}'::jsonb);

  -- NFT Kidz
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'NFT Kidz', 'nft-kidz', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tech_blockchain', 'nftkidz.io', 'active', false, true, '{}'::jsonb);

  -- NFT Pals
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'NFT Pals', 'nft-pals', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tech_blockchain', 'nftpals.io', 'active', false, true, '{"alternate_domains": ["nftpalz.io"]}'::jsonb);

  -- NFT Inspector
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'NFT Inspector', 'nft-inspector', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tech_blockchain', 'nftinspector.io', 'active', false, false, '{}'::jsonb);

  -- NFT Mixtapes
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'NFT Mixtapes', 'nft-mixtapes', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tech_blockchain', 'nftmixtapes.io', 'active', false, true, '{}'::jsonb);

  -- NFT Record Pool
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'NFT Record Pool', 'nft-record-pool', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tech_blockchain', 'nftrecordpool.io', 'active', false, true, '{}'::jsonb);

  -- NFT Tours
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'NFT Tours', 'nft-tours', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tech_blockchain', 'nfttours.io', 'active', false, false, '{"alternate_domains": ["nftvirtualtours.io"]}'::jsonb);

  -- Crypto Game Lab
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Crypto Game Lab', 'crypto-game-lab', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tech_blockchain', 'cryptogamelab.io', 'active', false, true, '{}'::jsonb);

  -- Lunar Wallet
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Lunar Wallet', 'lunar-wallet', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tech_blockchain', 'lunarwallet.com', 'active', false, false, '{}'::jsonb);

  -- Tendie Wallet
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Tendie Wallet', 'tendie-wallet', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tech_blockchain', 'tendiewallet.com', 'active', false, false, '{}'::jsonb);

  -- Tendie Token
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Tendie Token', 'tendie-token', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tech_blockchain', 'tendietoken.com', 'active', false, false, '{}'::jsonb);

  -- Balloon Swap
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Balloon Swap', 'balloon-swap', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tech_blockchain', 'balloonswap.com', 'active', false, false, '{}'::jsonb);

  -- NC Exchange
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'NC Exchange', 'nc-exchange', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tech_blockchain', 'ncexchange.io', 'active', false, false, '{}'::jsonb);

  -- Nodellium
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Nodellium', 'nodellium', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tech_blockchain', 'nodellium.com', 'active', false, false, '{"alternate_domains": ["nodellium.io"]}'::jsonb);

  -- Liquium
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Liquium', 'liquium', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tech_blockchain', 'liquium.io', 'active', false, false, '{}'::jsonb);

  -- Defi College
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Defi College', 'defi-college', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tech_blockchain', 'deficollege.org', 'active', false, false, '{}'::jsonb);

  -- The Art of the Blockchain
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'The Art of the Blockchain', 'the-art-of-the-blockchain', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tech_blockchain', 'theartoftheblockchain.com', 'active', false, false, '{}'::jsonb);

  -- Open City XR
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Open City XR', 'open-city-xr', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tech_blockchain', 'opencityxr.com', 'active', false, false, '{}'::jsonb);

  -- Open City VR
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Open City VR', 'open-city-vr', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tech_blockchain', 'opencityvr.com', 'active', false, false, '{}'::jsonb);

  -- -----------------------------------------------------------------------
  -- MEDIA & ENTERTAINMENT
  -- -----------------------------------------------------------------------

  -- Radio Copy AI
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Radio Copy AI', 'radio-copy-ai', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'media_entertainment', 'radiocopy.ai', 'active', false, true, '{"alternate_domains": ["radiocopy.io"]}'::jsonb);

  -- Battle for Radio
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Battle for Radio', 'battle-for-radio', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'media_entertainment', 'battle4radio.com', 'active', false, false, '{"alternate_domains": ["battleforradio.com"]}'::jsonb);

  -- Broadcast Copy AI
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Broadcast Copy AI', 'broadcast-copy-ai', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'media_entertainment', 'broadcastcopy.ai', 'active', false, true, '{}'::jsonb);

  -- Rap Convention
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Rap Convention', 'rap-convention', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'media_entertainment', 'rapconvention.com', 'active', false, false, '{}'::jsonb);

  -- -----------------------------------------------------------------------
  -- EVENTS
  -- -----------------------------------------------------------------------

  -- Dirt Wheel Fest
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Dirt Wheel Fest', 'dirt-wheel-fest', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'events', 'dirtwheelfest.com', 'active', false, true, '{"alternate_domains": ["dirtwheelfestival.com"]}'::jsonb);

  -- Pittsboro Palooza
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Pittsboro Palooza', 'pittsboro-palooza', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'events', 'pittsboropalooza.com', 'active', false, true, '{}'::jsonb);

  -- Fumble Pins
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Fumble Pins', 'fumble-pins', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'events', 'fumblepins.com', 'active', true, false, '{}'::jsonb);

  -- Chatham Axes
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Chatham Axes', 'chatham-axes', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'events', 'chathamaxes.com', 'active', true, false, '{}'::jsonb);

  -- -----------------------------------------------------------------------
  -- TOURS
  -- -----------------------------------------------------------------------

  -- Carolina Hemp Tours
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Carolina Hemp Tours', 'carolina-hemp-tours', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tours', 'carolinahemptours.com', 'active', false, true, '{"alternate_domains": ["carolinakushtours.com"]}'::jsonb);

  -- Carolina Hemp Club
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Carolina Hemp Club', 'carolina-hemp-club', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tours', 'carolinahempclub.com', 'active', false, true, '{}'::jsonb);

  -- Savannah Hemp Tours
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Savannah Hemp Tours', 'savannah-hemp-tours', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tours', 'savannahhemptours.com', 'active', false, true, '{"alternate_domains": ["savannahhempies.com"]}'::jsonb);

  -- VA Hemp Tours
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'VA Hemp Tours', 'va-hemp-tours', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tours', 'vahemptours.com', 'active', false, true, '{}'::jsonb);

  -- VA Kush Tours
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'VA Kush Tours', 'va-kush-tours', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tours', 'vakushtours.com', 'active', false, true, '{}'::jsonb);

  -- Jersey Kush Tours
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Jersey Kush Tours', 'jersey-kush-tours', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tours', 'jerseykushtours.com', 'active', false, true, '{}'::jsonb);

  -- NYC Kush Tours
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'NYC Kush Tours', 'nyc-kush-tours', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tours', 'nyckushtours.com', 'active', false, true, '{}'::jsonb);

  -- Georgia Hemp Tours
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Georgia Hemp Tours', 'georgia-hemp-tours', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tours', 'georgiahemptours.com', 'active', false, true, '{}'::jsonb);

  -- Georgia Kush Tours
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Georgia Kush Tours', 'georgia-kush-tours', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'tours', 'georgiakushtours.com', 'active', false, true, '{}'::jsonb);

  -- -----------------------------------------------------------------------
  -- AGRICULTURE
  -- -----------------------------------------------------------------------

  -- Gilmore Family Farms
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Gilmore Family Farms', 'gilmore-family-farms', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'agriculture', 'gilmorefamilyfarms.com', 'active', true, false, '{}'::jsonb);

  -- Sandhills Hemp Co
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Sandhills Hemp Co', 'sandhills-hemp-co', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'agriculture', 'sandhillshempco.com', 'active', true, true, '{}'::jsonb);

  -- Carolina Jars
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Carolina Jars', 'carolina-jars', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'agriculture', 'carolinajars.com', 'active', false, true, '{}'::jsonb);

  -- -----------------------------------------------------------------------
  -- SERVICES
  -- -----------------------------------------------------------------------

  -- Liberty H Janitorial
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Liberty H Janitorial', 'liberty-h-janitorial', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'services', 'libertyhjanitorial.com', 'active', false, false, '{}'::jsonb);

  -- Dave and Sons Contracting
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Dave and Sons Contracting', 'dave-and-sons-contracting', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'services', 'daveandsonscontracting.com', 'active', false, false, '{}'::jsonb);

  -- Carolina Imaging Pros
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Carolina Imaging Pros', 'carolina-imaging-pros', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'services', 'carolinaimagingpros.com', 'active', false, false, '{}'::jsonb);

  -- Transport Hub Logistics
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Transport Hub Logistics', 'transport-hub-logistics', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'services', 'transporthublogistics.com', 'active', false, false, '{}'::jsonb);

  -- Labor Yes
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Labor Yes', 'labor-yes', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'services', 'laboryes.com', 'active', false, false, '{}'::jsonb);

  -- -----------------------------------------------------------------------
  -- RETAIL
  -- -----------------------------------------------------------------------

  -- Pittsboro Ebikes
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Pittsboro Ebikes', 'pittsboro-ebikes', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'retail', 'pittsboroebikes.com', 'active', true, true, '{}'::jsonb);

  -- Carolina Battery Company
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Carolina Battery Company', 'carolina-battery-company', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'retail', 'carolinabatterycompany.com', 'active', false, true, '{}'::jsonb);

  -- Eau Nine
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Eau Nine', 'eau-nine', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'retail', 'eaunine.com', 'active', false, true, '{}'::jsonb);

  -- -----------------------------------------------------------------------
  -- REWARDS & MARKETING
  -- -----------------------------------------------------------------------

  -- Tarheel Rewards
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Tarheel Rewards', 'tarheel-rewards', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'rewards_marketing', 'tarheelrewards.com', 'active', false, true, '{}'::jsonb);

  -- Tarheel Brands (website)
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Tarheel Brands Website', 'tarheel-brands-website', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'rewards_marketing', 'tarheelbrands.com', 'active', false, true, '{}'::jsonb);

  -- Market Blimp
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Market Blimp', 'market-blimp', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'rewards_marketing', 'marketblimp.com', 'active', false, true, '{}'::jsonb);

  -- Booking Blimp
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Booking Blimp', 'booking-blimp', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'rewards_marketing', 'bookingblimp.com', 'active', false, true, '{}'::jsonb);

  -- Ticket Blimp
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Ticket Blimp', 'ticket-blimp', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'rewards_marketing', 'ticketblimp.com', 'active', false, true, '{}'::jsonb);

  -- -----------------------------------------------------------------------
  -- REAL ESTATE
  -- -----------------------------------------------------------------------

  -- NC Home Finder
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'NC Home Finder', 'nc-home-finder', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'real_estate', 'nchomefinder.com', 'active', false, true, '{}'::jsonb);

  -- -----------------------------------------------------------------------
  -- PETS
  -- -----------------------------------------------------------------------

  -- Sell My Dog
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Sell My Dog', 'sell-my-dog', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'pets', 'sellmydog.net', 'active', false, true, '{}'::jsonb);

  -- Sale My Dog
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Sale My Dog', 'sale-my-dog', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'pets', 'salemydog.com', 'active', false, true, '{}'::jsonb);

  -- -----------------------------------------------------------------------
  -- EDUCATION
  -- -----------------------------------------------------------------------

  -- The Virtual Muslim
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'The Virtual Muslim', 'the-virtual-muslim', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'education', 'thevirtualmuslim.com', 'active', false, true, '{}'::jsonb);

  -- -----------------------------------------------------------------------
  -- OTHER
  -- -----------------------------------------------------------------------

  -- South Armz Global (brand site)
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'South Armz Global Website', 'south-armz-global-website', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'other', 'southarmzglobal.com', 'active', false, true, '{}'::jsonb);

  -- Ricoveli Worldwide
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Ricoveli Worldwide', 'ricoveli-worldwide', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'other', 'ricoveliworldwide.com', 'active', false, true, '{}'::jsonb);

  -- The Carolina Effect
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'The Carolina Effect', 'the-carolina-effect', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'other', 'thecarolinaeffect.com', 'active', false, false, '{}'::jsonb);

  -- Out the Ville NC
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'Out the Ville NC', 'out-the-ville-nc', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'other', 'outthevillenc.com', 'active', false, false, '{}'::jsonb);

  -- NC Tix
  v_org_id := gen_random_uuid();
  INSERT INTO corp.organizations (id, parent_id, name, slug, type, city, state, status, metadata)
  VALUES (v_org_id, v_operating_id, 'NC Tix', 'nc-tix', 'business', 'Pittsboro', 'NC', 'active', '{}'::jsonb);
  INSERT INTO corp.businesses (id, org_id, category, domain_name, domain_status, is_brick_mortar, is_ecommerce, metadata)
  VALUES (gen_random_uuid(), v_org_id, 'other', 'nctix.com', 'active', false, true, '{}'::jsonb);

END $$;


-- =============================================================================
-- 2. DEFAULT CHART OF ACCOUNTS TEMPLATE
-- =============================================================================
-- org_id = NULL means this is the global template.
-- Each business will get a copy when onboarded.
-- =============================================================================

INSERT INTO corp.chart_of_accounts (id, org_id, account_number, name, type, subtype, parent_id, is_header, normal_balance, description, is_active) VALUES

-- ---------------------------------------------------------------------------
-- 1000s - ASSETS
-- ---------------------------------------------------------------------------
(gen_random_uuid(), NULL, '1000', 'Assets',                          'asset',     NULL,              NULL, true,  'debit',  'Top-level asset header',                   true),
(gen_random_uuid(), NULL, '1010', 'Cash on Hand',                    'asset',     'cash',            NULL, false, 'debit',  'Physical cash in register or safe',        true),
(gen_random_uuid(), NULL, '1020', 'Business Checking',               'asset',     'cash',            NULL, false, 'debit',  'Primary business checking account',        true),
(gen_random_uuid(), NULL, '1030', 'Business Savings',                'asset',     'cash',            NULL, false, 'debit',  'Business savings account',                 true),
(gen_random_uuid(), NULL, '1040', 'Payroll Account',                 'asset',     'cash',            NULL, false, 'debit',  'Dedicated payroll bank account',           true),
(gen_random_uuid(), NULL, '1050', 'Petty Cash',                      'asset',     'cash',            NULL, false, 'debit',  'Petty cash fund',                          true),
(gen_random_uuid(), NULL, '1100', 'Accounts Receivable',             'asset',     'receivable',      NULL, false, 'debit',  'Money owed by customers',                  true),
(gen_random_uuid(), NULL, '1150', 'Employee Advances',               'asset',     'receivable',      NULL, false, 'debit',  'Advances paid to employees',               true),
(gen_random_uuid(), NULL, '1200', 'Inventory',                       'asset',     'inventory',       NULL, false, 'debit',  'Goods held for sale',                      true),
(gen_random_uuid(), NULL, '1210', 'Raw Materials',                   'asset',     'inventory',       NULL, false, 'debit',  'Unprocessed materials inventory',           true),
(gen_random_uuid(), NULL, '1220', 'Work in Progress',                'asset',     'inventory',       NULL, false, 'debit',  'Partially completed goods',                 true),
(gen_random_uuid(), NULL, '1230', 'Finished Goods',                  'asset',     'inventory',       NULL, false, 'debit',  'Completed goods ready for sale',            true),
(gen_random_uuid(), NULL, '1300', 'Prepaid Expenses',                'asset',     'prepaid',         NULL, false, 'debit',  'Expenses paid in advance',                 true),
(gen_random_uuid(), NULL, '1310', 'Prepaid Insurance',               'asset',     'prepaid',         NULL, false, 'debit',  'Insurance premiums paid in advance',        true),
(gen_random_uuid(), NULL, '1320', 'Prepaid Rent',                    'asset',     'prepaid',         NULL, false, 'debit',  'Rent paid in advance',                     true),
(gen_random_uuid(), NULL, '1400', 'Fixed Assets',                    'asset',     'fixed',           NULL, true,  'debit',  'Long-term tangible assets header',         true),
(gen_random_uuid(), NULL, '1410', 'Furniture & Fixtures',            'asset',     'fixed',           NULL, false, 'debit',  'Office and store furniture',                true),
(gen_random_uuid(), NULL, '1420', 'Equipment',                       'asset',     'fixed',           NULL, false, 'debit',  'Machinery and equipment',                  true),
(gen_random_uuid(), NULL, '1430', 'Vehicles',                        'asset',     'fixed',           NULL, false, 'debit',  'Company vehicles',                         true),
(gen_random_uuid(), NULL, '1440', 'Leasehold Improvements',          'asset',     'fixed',           NULL, false, 'debit',  'Improvements to leased property',           true),
(gen_random_uuid(), NULL, '1450', 'Computer Equipment',              'asset',     'fixed',           NULL, false, 'debit',  'Computers, servers, and IT equipment',      true),
(gen_random_uuid(), NULL, '1500', 'Accumulated Depreciation',        'asset',     'contra',          NULL, false, 'credit', 'Accumulated depreciation on fixed assets',  true),
(gen_random_uuid(), NULL, '1600', 'Security Deposits',               'asset',     'other',           NULL, false, 'debit',  'Deposits paid as security',                true),
(gen_random_uuid(), NULL, '1700', 'Crypto Assets',                   'asset',     'digital',         NULL, false, 'debit',  'Cryptocurrency and digital asset holdings', true),

-- ---------------------------------------------------------------------------
-- 2000s - LIABILITIES
-- ---------------------------------------------------------------------------
(gen_random_uuid(), NULL, '2000', 'Liabilities',                     'liability', NULL,              NULL, true,  'credit', 'Top-level liability header',               true),
(gen_random_uuid(), NULL, '2010', 'Accounts Payable',                'liability', 'payable',         NULL, false, 'credit', 'Money owed to vendors and suppliers',       true),
(gen_random_uuid(), NULL, '2050', 'Accrued Expenses',                'liability', 'accrued',         NULL, false, 'credit', 'Expenses incurred but not yet paid',        true),
(gen_random_uuid(), NULL, '2100', 'Credit Card - Business',          'liability', 'credit_card',     NULL, false, 'credit', 'Primary business credit card',              true),
(gen_random_uuid(), NULL, '2110', 'Credit Card - Secondary',         'liability', 'credit_card',     NULL, false, 'credit', 'Secondary business credit card',             true),
(gen_random_uuid(), NULL, '2200', 'Payroll Liabilities',             'liability', 'payroll',         NULL, true,  'credit', 'Payroll-related liabilities header',        true),
(gen_random_uuid(), NULL, '2210', 'Federal Income Tax Payable',      'liability', 'payroll',         NULL, false, 'credit', 'Employee federal tax withholding',           true),
(gen_random_uuid(), NULL, '2220', 'State Income Tax Payable',        'liability', 'payroll',         NULL, false, 'credit', 'Employee state tax withholding',             true),
(gen_random_uuid(), NULL, '2230', 'FICA Payable',                    'liability', 'payroll',         NULL, false, 'credit', 'Social Security and Medicare taxes',         true),
(gen_random_uuid(), NULL, '2240', 'Federal Unemployment Payable',    'liability', 'payroll',         NULL, false, 'credit', 'FUTA tax liability',                        true),
(gen_random_uuid(), NULL, '2250', 'State Unemployment Payable',      'liability', 'payroll',         NULL, false, 'credit', 'SUTA tax liability',                        true),
(gen_random_uuid(), NULL, '2260', 'Wages Payable',                   'liability', 'payroll',         NULL, false, 'credit', 'Unpaid wages owed to employees',             true),
(gen_random_uuid(), NULL, '2300', 'Sales Tax Payable',               'liability', 'tax',             NULL, false, 'credit', 'Collected sales tax owed to state',          true),
(gen_random_uuid(), NULL, '2400', 'Short-Term Loans',                'liability', 'loan',            NULL, false, 'credit', 'Loans due within one year',                  true),
(gen_random_uuid(), NULL, '2500', 'Long-Term Loans',                 'liability', 'loan',            NULL, false, 'credit', 'Loans due after one year',                   true),
(gen_random_uuid(), NULL, '2510', 'Vehicle Loans',                   'liability', 'loan',            NULL, false, 'credit', 'Loans on company vehicles',                  true),
(gen_random_uuid(), NULL, '2520', 'Equipment Loans',                 'liability', 'loan',            NULL, false, 'credit', 'Loans on equipment purchases',               true),
(gen_random_uuid(), NULL, '2600', 'Unearned Revenue',                'liability', 'deferred',        NULL, false, 'credit', 'Payments received before service delivery',  true),
(gen_random_uuid(), NULL, '2700', 'Customer Deposits',               'liability', 'deferred',        NULL, false, 'credit', 'Deposits received from customers',           true),

-- ---------------------------------------------------------------------------
-- 3000s - EQUITY
-- ---------------------------------------------------------------------------
(gen_random_uuid(), NULL, '3000', 'Equity',                          'equity',    NULL,              NULL, true,  'credit', 'Top-level equity header',                   true),
(gen_random_uuid(), NULL, '3010', 'Owner''s Equity',                 'equity',    'owners',          NULL, false, 'credit', 'Owner investment in the business',           true),
(gen_random_uuid(), NULL, '3020', 'Owner''s Draw',                   'equity',    'draw',            NULL, false, 'debit',  'Withdrawals by the owner',                  true),
(gen_random_uuid(), NULL, '3030', 'Retained Earnings',               'equity',    'retained',        NULL, false, 'credit', 'Accumulated net income from prior periods',  true),
(gen_random_uuid(), NULL, '3040', 'Additional Paid-In Capital',      'equity',    'capital',         NULL, false, 'credit', 'Capital contributions above par value',      true),
(gen_random_uuid(), NULL, '3050', 'Dividends Paid',                  'equity',    'distribution',    NULL, false, 'debit',  'Dividends distributed to owners',           true),

-- ---------------------------------------------------------------------------
-- 4000s - REVENUE
-- ---------------------------------------------------------------------------
(gen_random_uuid(), NULL, '4000', 'Revenue',                         'revenue',   NULL,              NULL, true,  'credit', 'Top-level revenue header',                  true),
(gen_random_uuid(), NULL, '4010', 'Product Sales',                   'revenue',   'sales',           NULL, false, 'credit', 'Revenue from product sales',                 true),
(gen_random_uuid(), NULL, '4020', 'Service Revenue',                 'revenue',   'service',         NULL, false, 'credit', 'Revenue from services provided',             true),
(gen_random_uuid(), NULL, '4030', 'Food & Beverage Sales',           'revenue',   'sales',           NULL, false, 'credit', 'Revenue from food and drink sales',          true),
(gen_random_uuid(), NULL, '4040', 'Tour Revenue',                    'revenue',   'service',         NULL, false, 'credit', 'Revenue from tour bookings',                 true),
(gen_random_uuid(), NULL, '4050', 'Event Revenue',                   'revenue',   'service',         NULL, false, 'credit', 'Revenue from events and admissions',         true),
(gen_random_uuid(), NULL, '4060', 'Subscription Revenue',            'revenue',   'recurring',       NULL, false, 'credit', 'Recurring subscription income',              true),
(gen_random_uuid(), NULL, '4070', 'Consulting Revenue',              'revenue',   'service',         NULL, false, 'credit', 'Revenue from consulting services',           true),
(gen_random_uuid(), NULL, '4080', 'Commission Revenue',              'revenue',   'commission',      NULL, false, 'credit', 'Revenue from commissions earned',            true),
(gen_random_uuid(), NULL, '4090', 'Marketplace Revenue',             'revenue',   'marketplace',     NULL, false, 'credit', 'Revenue from marketplace transactions',      true),
(gen_random_uuid(), NULL, '4100', 'Rental Income',                   'revenue',   'rental',          NULL, false, 'credit', 'Income from property or equipment rental',   true),
(gen_random_uuid(), NULL, '4200', 'Tips & Gratuities',               'revenue',   'tips',            NULL, false, 'credit', 'Tips received from customers',               true),
(gen_random_uuid(), NULL, '4300', 'Rewards Program Revenue',         'revenue',   'loyalty',         NULL, false, 'credit', 'Revenue from loyalty program fees',          true),
(gen_random_uuid(), NULL, '4400', 'Crypto & Token Revenue',          'revenue',   'digital',         NULL, false, 'credit', 'Revenue from crypto and token activities',   true),
(gen_random_uuid(), NULL, '4500', 'Advertising Revenue',             'revenue',   'advertising',     NULL, false, 'credit', 'Revenue from ad placements',                 true),
(gen_random_uuid(), NULL, '4800', 'Refunds & Returns',               'revenue',   'contra',          NULL, false, 'debit',  'Customer refunds and returns (contra)',      true),
(gen_random_uuid(), NULL, '4900', 'Other Income',                    'revenue',   'other',           NULL, false, 'credit', 'Miscellaneous income',                       true),
(gen_random_uuid(), NULL, '4910', 'Interest Income',                 'revenue',   'interest',        NULL, false, 'credit', 'Interest earned on deposits',                true),
(gen_random_uuid(), NULL, '4920', 'Gain on Asset Sale',              'revenue',   'gain',            NULL, false, 'credit', 'Gain from disposal of assets',               true),

-- ---------------------------------------------------------------------------
-- 5000s - COST OF GOODS SOLD
-- ---------------------------------------------------------------------------
(gen_random_uuid(), NULL, '5000', 'Cost of Goods Sold',              'cogs',      NULL,              NULL, true,  'debit',  'Top-level COGS header',                     true),
(gen_random_uuid(), NULL, '5010', 'Product Cost',                    'cogs',      'product',         NULL, false, 'debit',  'Direct cost of products sold',               true),
(gen_random_uuid(), NULL, '5020', 'Food & Beverage Cost',            'cogs',      'food',            NULL, false, 'debit',  'Direct cost of food and beverage items',     true),
(gen_random_uuid(), NULL, '5030', 'Materials & Supplies Cost',       'cogs',      'materials',       NULL, false, 'debit',  'Cost of raw materials and supplies',          true),
(gen_random_uuid(), NULL, '5040', 'Direct Labor',                    'cogs',      'labor',           NULL, false, 'debit',  'Direct labor costs for goods produced',       true),
(gen_random_uuid(), NULL, '5050', 'Shipping & Freight (Inbound)',    'cogs',      'freight',         NULL, false, 'debit',  'Inbound shipping costs on inventory',        true),
(gen_random_uuid(), NULL, '5060', 'Packaging Costs',                 'cogs',      'packaging',       NULL, false, 'debit',  'Cost of packaging materials',                true),
(gen_random_uuid(), NULL, '5070', 'Manufacturing Overhead',          'cogs',      'overhead',        NULL, false, 'debit',  'Indirect production costs',                  true),
(gen_random_uuid(), NULL, '5080', 'Inventory Shrinkage',             'cogs',      'shrinkage',       NULL, false, 'debit',  'Losses due to theft, damage, or spoilage',   true),
(gen_random_uuid(), NULL, '5090', 'Cost of Services',                'cogs',      'service',         NULL, false, 'debit',  'Direct costs of services delivered',          true),

-- ---------------------------------------------------------------------------
-- 6000s - OPERATING EXPENSES
-- ---------------------------------------------------------------------------
(gen_random_uuid(), NULL, '6000', 'Operating Expenses',              'expense',   NULL,              NULL, true,  'debit',  'Top-level operating expenses header',        true),
(gen_random_uuid(), NULL, '6010', 'Rent Expense',                    'expense',   'occupancy',       NULL, false, 'debit',  'Rent for office, retail, or warehouse space', true),
(gen_random_uuid(), NULL, '6020', 'Utilities - Electric',            'expense',   'utilities',       NULL, false, 'debit',  'Electricity costs',                          true),
(gen_random_uuid(), NULL, '6025', 'Utilities - Gas',                 'expense',   'utilities',       NULL, false, 'debit',  'Natural gas costs',                          true),
(gen_random_uuid(), NULL, '6030', 'Utilities - Water & Sewer',       'expense',   'utilities',       NULL, false, 'debit',  'Water and sewer charges',                    true),
(gen_random_uuid(), NULL, '6035', 'Utilities - Trash',               'expense',   'utilities',       NULL, false, 'debit',  'Waste disposal and recycling',               true),
(gen_random_uuid(), NULL, '6040', 'Internet & Phone',                'expense',   'telecom',         NULL, false, 'debit',  'Internet, phone, and telecom services',       true),
(gen_random_uuid(), NULL, '6050', 'Insurance Expense',               'expense',   'insurance',       NULL, false, 'debit',  'Business insurance premiums',                 true),
(gen_random_uuid(), NULL, '6060', 'Property Tax',                    'expense',   'tax',             NULL, false, 'debit',  'Property tax on owned or leased property',    true),
(gen_random_uuid(), NULL, '6070', 'Repairs & Maintenance',           'expense',   'maintenance',     NULL, false, 'debit',  'Building and equipment repairs',              true),
(gen_random_uuid(), NULL, '6080', 'Janitorial & Cleaning',           'expense',   'maintenance',     NULL, false, 'debit',  'Cleaning and janitorial services',            true),
(gen_random_uuid(), NULL, '6090', 'Security Services',               'expense',   'security',        NULL, false, 'debit',  'Security monitoring and guard services',      true),

-- ---------------------------------------------------------------------------
-- 6100s - PAYROLL & BENEFITS EXPENSES
-- ---------------------------------------------------------------------------
(gen_random_uuid(), NULL, '6100', 'Payroll Expenses',                'expense',   'payroll',         NULL, true,  'debit',  'Payroll expenses header',                    true),
(gen_random_uuid(), NULL, '6110', 'Salaries & Wages',                'expense',   'payroll',         NULL, false, 'debit',  'Employee salaries and hourly wages',          true),
(gen_random_uuid(), NULL, '6120', 'Payroll Taxes',                   'expense',   'payroll',         NULL, false, 'debit',  'Employer portion of payroll taxes',            true),
(gen_random_uuid(), NULL, '6130', 'Health Insurance',                'expense',   'benefits',        NULL, false, 'debit',  'Employer-provided health insurance',           true),
(gen_random_uuid(), NULL, '6140', 'Workers Compensation',            'expense',   'benefits',        NULL, false, 'debit',  'Workers compensation insurance',               true),
(gen_random_uuid(), NULL, '6150', 'Retirement Plan Contributions',   'expense',   'benefits',        NULL, false, 'debit',  '401k or other retirement contributions',       true),
(gen_random_uuid(), NULL, '6160', 'Contract Labor',                  'expense',   'payroll',         NULL, false, 'debit',  'Payments to independent contractors',          true),
(gen_random_uuid(), NULL, '6170', 'Employee Training',               'expense',   'development',     NULL, false, 'debit',  'Staff training and development costs',         true),
(gen_random_uuid(), NULL, '6180', 'Recruiting & Hiring',             'expense',   'hr',              NULL, false, 'debit',  'Costs for recruiting and onboarding',          true),
(gen_random_uuid(), NULL, '6190', 'Employee Meals & Entertainment',  'expense',   'perks',           NULL, false, 'debit',  'Staff meals and entertainment expenses',       true),

-- ---------------------------------------------------------------------------
-- 6200s - OFFICE & ADMINISTRATIVE EXPENSES
-- ---------------------------------------------------------------------------
(gen_random_uuid(), NULL, '6200', 'Office Expenses',                 'expense',   'office',          NULL, true,  'debit',  'Office expenses header',                      true),
(gen_random_uuid(), NULL, '6210', 'Office Supplies',                 'expense',   'office',          NULL, false, 'debit',  'Paper, pens, and general supplies',            true),
(gen_random_uuid(), NULL, '6220', 'Printing & Copying',              'expense',   'office',          NULL, false, 'debit',  'Printing and copying costs',                   true),
(gen_random_uuid(), NULL, '6230', 'Postage & Shipping',              'expense',   'shipping',        NULL, false, 'debit',  'Outbound postage and shipping costs',          true),
(gen_random_uuid(), NULL, '6240', 'Bank Fees & Charges',             'expense',   'financial',       NULL, false, 'debit',  'Bank account and service fees',                true),
(gen_random_uuid(), NULL, '6250', 'Credit Card Processing Fees',     'expense',   'financial',       NULL, false, 'debit',  'Merchant processing and POS fees',             true),
(gen_random_uuid(), NULL, '6260', 'Accounting & Bookkeeping',        'expense',   'professional',    NULL, false, 'debit',  'Accounting and bookkeeping services',          true),
(gen_random_uuid(), NULL, '6270', 'Legal Fees',                      'expense',   'professional',    NULL, false, 'debit',  'Attorney and legal service fees',              true),
(gen_random_uuid(), NULL, '6280', 'Licenses & Permits',              'expense',   'regulatory',      NULL, false, 'debit',  'Business licenses and permits',                true),
(gen_random_uuid(), NULL, '6290', 'Dues & Subscriptions',            'expense',   'subscriptions',   NULL, false, 'debit',  'Professional memberships and subscriptions',   true),

-- ---------------------------------------------------------------------------
-- 6300s - TECHNOLOGY EXPENSES
-- ---------------------------------------------------------------------------
(gen_random_uuid(), NULL, '6300', 'Technology Expenses',             'expense',   'technology',      NULL, true,  'debit',  'Technology expenses header',                   true),
(gen_random_uuid(), NULL, '6310', 'Software & SaaS',                 'expense',   'software',        NULL, false, 'debit',  'Software licenses and subscriptions',          true),
(gen_random_uuid(), NULL, '6320', 'Hosting & Cloud Services',        'expense',   'hosting',         NULL, false, 'debit',  'Web hosting and cloud infrastructure',         true),
(gen_random_uuid(), NULL, '6330', 'Domain & SSL Expenses',           'expense',   'domains',         NULL, false, 'debit',  'Domain registration and SSL certificates',     true),
(gen_random_uuid(), NULL, '6340', 'IT Support & Maintenance',        'expense',   'it_support',      NULL, false, 'debit',  'IT support and managed services',              true),
(gen_random_uuid(), NULL, '6350', 'POS System Fees',                 'expense',   'pos',             NULL, false, 'debit',  'Toast POS and related system fees',            true),
(gen_random_uuid(), NULL, '6360', 'Blockchain & Gas Fees',           'expense',   'blockchain',      NULL, false, 'debit',  'Blockchain transaction and gas fees',          true),

-- ---------------------------------------------------------------------------
-- 6400s - MARKETING & ADVERTISING
-- ---------------------------------------------------------------------------
(gen_random_uuid(), NULL, '6400', 'Marketing & Advertising',         'expense',   'marketing',       NULL, true,  'debit',  'Marketing expenses header',                    true),
(gen_random_uuid(), NULL, '6410', 'Digital Advertising',             'expense',   'advertising',     NULL, false, 'debit',  'Google Ads, Facebook Ads, social media ads',   true),
(gen_random_uuid(), NULL, '6420', 'Print Advertising',               'expense',   'advertising',     NULL, false, 'debit',  'Newspapers, magazines, flyers, and signage',   true),
(gen_random_uuid(), NULL, '6430', 'Social Media Marketing',          'expense',   'marketing',       NULL, false, 'debit',  'Social media management and content costs',    true),
(gen_random_uuid(), NULL, '6440', 'Email Marketing',                 'expense',   'marketing',       NULL, false, 'debit',  'Email marketing platforms and campaigns',      true),
(gen_random_uuid(), NULL, '6450', 'SEO & Content Marketing',         'expense',   'marketing',       NULL, false, 'debit',  'SEO tools and content creation',               true),
(gen_random_uuid(), NULL, '6460', 'Promotional Materials',           'expense',   'marketing',       NULL, false, 'debit',  'Branded merchandise and promo items',          true),
(gen_random_uuid(), NULL, '6470', 'Sponsorships & Events',           'expense',   'events',          NULL, false, 'debit',  'Event sponsorship and participation fees',     true),
(gen_random_uuid(), NULL, '6480', 'Influencer & Affiliate Costs',    'expense',   'marketing',       NULL, false, 'debit',  'Influencer partnerships and affiliate fees',   true),
(gen_random_uuid(), NULL, '6490', 'Rewards Program Costs',           'expense',   'loyalty',         NULL, false, 'debit',  'Costs of running loyalty and rewards program', true),

-- ---------------------------------------------------------------------------
-- 6500s - VEHICLE & TRAVEL
-- ---------------------------------------------------------------------------
(gen_random_uuid(), NULL, '6500', 'Vehicle & Travel',                'expense',   'travel',          NULL, true,  'debit',  'Vehicle and travel expenses header',           true),
(gen_random_uuid(), NULL, '6510', 'Vehicle Fuel',                    'expense',   'vehicle',         NULL, false, 'debit',  'Fuel costs for company vehicles',              true),
(gen_random_uuid(), NULL, '6520', 'Vehicle Maintenance',             'expense',   'vehicle',         NULL, false, 'debit',  'Maintenance and repairs on vehicles',          true),
(gen_random_uuid(), NULL, '6530', 'Vehicle Insurance',               'expense',   'vehicle',         NULL, false, 'debit',  'Insurance on company vehicles',                true),
(gen_random_uuid(), NULL, '6540', 'Mileage Reimbursement',           'expense',   'travel',          NULL, false, 'debit',  'Employee mileage reimbursements',              true),
(gen_random_uuid(), NULL, '6550', 'Travel - Lodging',                'expense',   'travel',          NULL, false, 'debit',  'Hotel and lodging for business travel',        true),
(gen_random_uuid(), NULL, '6560', 'Travel - Airfare',                'expense',   'travel',          NULL, false, 'debit',  'Flights for business travel',                  true),
(gen_random_uuid(), NULL, '6570', 'Travel - Meals',                  'expense',   'travel',          NULL, false, 'debit',  'Meals during business travel',                 true),
(gen_random_uuid(), NULL, '6580', 'Parking & Tolls',                 'expense',   'travel',          NULL, false, 'debit',  'Parking fees and road tolls',                  true),

-- ---------------------------------------------------------------------------
-- 7000s - DEPRECIATION & AMORTIZATION
-- ---------------------------------------------------------------------------
(gen_random_uuid(), NULL, '7000', 'Depreciation & Amortization',     'expense',   'depreciation',    NULL, true,  'debit',  'Depreciation and amortization header',         true),
(gen_random_uuid(), NULL, '7010', 'Depreciation - Equipment',        'expense',   'depreciation',    NULL, false, 'debit',  'Depreciation on equipment',                    true),
(gen_random_uuid(), NULL, '7020', 'Depreciation - Vehicles',         'expense',   'depreciation',    NULL, false, 'debit',  'Depreciation on company vehicles',              true),
(gen_random_uuid(), NULL, '7030', 'Depreciation - Leasehold',        'expense',   'depreciation',    NULL, false, 'debit',  'Amortization of leasehold improvements',        true),
(gen_random_uuid(), NULL, '7040', 'Depreciation - Computers',        'expense',   'depreciation',    NULL, false, 'debit',  'Depreciation on IT equipment',                  true),
(gen_random_uuid(), NULL, '7050', 'Amortization - Intangibles',      'expense',   'amortization',    NULL, false, 'debit',  'Amortization of intangible assets',             true),

-- ---------------------------------------------------------------------------
-- 8000s - OTHER EXPENSES
-- ---------------------------------------------------------------------------
(gen_random_uuid(), NULL, '8000', 'Other Expenses',                  'expense',   NULL,              NULL, true,  'debit',  'Other expenses header',                         true),
(gen_random_uuid(), NULL, '8010', 'Interest Expense',                'expense',   'interest',        NULL, false, 'debit',  'Interest on loans and credit',                  true),
(gen_random_uuid(), NULL, '8020', 'Bad Debt Expense',                'expense',   'bad_debt',        NULL, false, 'debit',  'Uncollectible accounts receivable',              true),
(gen_random_uuid(), NULL, '8030', 'Charitable Contributions',        'expense',   'donations',       NULL, false, 'debit',  'Donations to charitable organizations',          true),
(gen_random_uuid(), NULL, '8040', 'Penalties & Fines',               'expense',   'penalties',       NULL, false, 'debit',  'Government fines and late payment penalties',    true),
(gen_random_uuid(), NULL, '8050', 'Loss on Asset Disposal',          'expense',   'loss',            NULL, false, 'debit',  'Losses from selling or disposing of assets',     true),
(gen_random_uuid(), NULL, '8060', 'Crypto Losses',                   'expense',   'digital',         NULL, false, 'debit',  'Losses from cryptocurrency transactions',        true),

-- ---------------------------------------------------------------------------
-- 9000s - TAX EXPENSE
-- ---------------------------------------------------------------------------
(gen_random_uuid(), NULL, '9000', 'Tax Expenses',                    'expense',   'tax',             NULL, true,  'debit',  'Tax expenses header',                           true),
(gen_random_uuid(), NULL, '9010', 'Federal Income Tax',              'expense',   'income_tax',      NULL, false, 'debit',  'Federal income tax expense',                     true),
(gen_random_uuid(), NULL, '9020', 'State Income Tax',                'expense',   'income_tax',      NULL, false, 'debit',  'State income tax expense',                       true),
(gen_random_uuid(), NULL, '9030', 'Local Business Tax',              'expense',   'business_tax',    NULL, false, 'debit',  'Local and municipal business taxes',              true),
(gen_random_uuid(), NULL, '9040', 'Franchise Tax',                   'expense',   'business_tax',    NULL, false, 'debit',  'State franchise tax',                             true),
(gen_random_uuid(), NULL, '9050', 'Self-Employment Tax',             'expense',   'self_employment',  NULL, false, 'debit',  'Self-employment tax for owner',                   true);


-- =============================================================================
-- 3. DEFAULT DOCUMENT TYPES
-- =============================================================================

INSERT INTO corp.document_types (id, name, slug, category, requires_expiry, is_required) VALUES

-- Tax Documents
(gen_random_uuid(), 'W-4 (Employee Withholding)',           'w-4',                    'tax',            false, true),
(gen_random_uuid(), 'W-9 (Taxpayer Identification)',        'w-9',                    'tax',            false, false),
(gen_random_uuid(), 'W-2 (Wage and Tax Statement)',         'w-2',                    'tax',            false, false),
(gen_random_uuid(), '1099-NEC (Nonemployee Compensation)',  '1099-nec',               'tax',            false, false),
(gen_random_uuid(), '1099-MISC',                            '1099-misc',              'tax',            false, false),
(gen_random_uuid(), 'NC-4 (NC Withholding)',                'nc-4',                   'tax',            false, true),

-- Identification Documents
(gen_random_uuid(), 'I-9 (Employment Eligibility)',         'i-9',                    'identification', true,  true),
(gen_random_uuid(), 'Driver''s License Copy',               'drivers-license',        'identification', true,  false),
(gen_random_uuid(), 'Social Security Card Copy',            'social-security-card',   'identification', false, false),
(gen_random_uuid(), 'Passport Copy',                        'passport-copy',          'identification', true,  false),
(gen_random_uuid(), 'Work Authorization (EAD)',             'work-authorization',     'identification', true,  false),
(gen_random_uuid(), 'E-Verify Confirmation',                'e-verify',               'identification', false, false),

-- Contract Documents
(gen_random_uuid(), 'Employment Contract',                  'employment-contract',    'contract',       true,  false),
(gen_random_uuid(), 'Offer Letter',                         'offer-letter',           'contract',       false, false),
(gen_random_uuid(), 'Non-Disclosure Agreement (NDA)',       'nda',                    'contract',       true,  false),
(gen_random_uuid(), 'Non-Compete Agreement',                'non-compete',            'contract',       true,  false),
(gen_random_uuid(), 'Independent Contractor Agreement',     'contractor-agreement',   'contract',       true,  false),
(gen_random_uuid(), 'Separation Agreement',                 'separation-agreement',   'contract',       false, false),

-- Certification Documents
(gen_random_uuid(), 'Food Handler''s Permit',               'food-handlers-permit',   'certification',  true,  false),
(gen_random_uuid(), 'ServSafe Certification',               'servsafe',               'certification',  true,  false),
(gen_random_uuid(), 'ABC Permit (Alcohol)',                  'abc-permit',             'certification',  true,  false),
(gen_random_uuid(), 'CPR/First Aid Certification',          'cpr-first-aid',          'certification',  true,  false),
(gen_random_uuid(), 'OSHA Training Certificate',            'osha-training',          'certification',  true,  false),
(gen_random_uuid(), 'Professional License',                 'professional-license',   'certification',  true,  false),
(gen_random_uuid(), 'Forklift Certification',               'forklift-cert',          'certification',  true,  false),

-- Policy Documents
(gen_random_uuid(), 'Employee Handbook Acknowledgment',     'handbook-acknowledgment','policy',         false, true),
(gen_random_uuid(), 'Direct Deposit Authorization',         'direct-deposit',         'policy',         false, true),
(gen_random_uuid(), 'Drug Testing Consent',                 'drug-test-consent',      'policy',         false, false),
(gen_random_uuid(), 'Background Check Authorization',       'background-check',       'policy',         false, true),
(gen_random_uuid(), 'Workplace Safety Policy',              'safety-policy',          'policy',         false, false),
(gen_random_uuid(), 'IT & Acceptable Use Policy',           'it-acceptable-use',      'policy',         false, false),
(gen_random_uuid(), 'Anti-Harassment Policy',               'anti-harassment',        'policy',         false, true),
(gen_random_uuid(), 'PTO & Leave Policy',                   'pto-leave-policy',       'policy',         false, false),
(gen_random_uuid(), 'Conflict of Interest Disclosure',      'conflict-of-interest',   'policy',         false, false),
(gen_random_uuid(), 'Emergency Contact Form',               'emergency-contact',      'policy',         false, true),
(gen_random_uuid(), 'Uniform & Dress Code Policy',          'uniform-dress-code',     'policy',         false, false),
(gen_random_uuid(), 'Vehicle Use Agreement',                'vehicle-use-agreement',  'policy',         false, false),

-- Review Documents
(gen_random_uuid(), 'Performance Review',                   'performance-review',     'review',         false, false),
(gen_random_uuid(), '90-Day Evaluation',                    '90-day-evaluation',      'review',         false, false),
(gen_random_uuid(), 'Annual Review',                        'annual-review',          'review',         false, false),
(gen_random_uuid(), 'Written Warning',                      'written-warning',        'review',         false, false),
(gen_random_uuid(), 'Corrective Action Plan',               'corrective-action',      'review',         false, false),
(gen_random_uuid(), 'Termination Notice',                   'termination-notice',     'review',         false, false),

-- Other Documents
(gen_random_uuid(), 'Business License',                     'business-license',       'other',          true,  false),
(gen_random_uuid(), 'Certificate of Insurance (COI)',       'coi',                    'other',          true,  false),
(gen_random_uuid(), 'Lease Agreement',                      'lease-agreement',        'other',          true,  false),
(gen_random_uuid(), 'Vendor Agreement',                     'vendor-agreement',       'other',          true,  false),
(gen_random_uuid(), 'Tax Exempt Certificate',               'tax-exempt-cert',        'other',          true,  false),
(gen_random_uuid(), 'Health Department Inspection',         'health-inspection',      'other',          true,  false),
(gen_random_uuid(), 'Fire Inspection Report',               'fire-inspection',        'other',          true,  false),
(gen_random_uuid(), 'Miscellaneous',                        'miscellaneous',          'other',          false, false);

COMMIT;

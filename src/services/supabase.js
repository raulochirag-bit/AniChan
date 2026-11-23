import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://otagppbjhpregamlfibp.supabase.co'
const supabaseKey = 'sb_publishable_1sdtWzU6L_7-o_ASFPDQXA_CcuYGGRc'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)

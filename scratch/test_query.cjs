const { createClient } = require('@supabase/supabase-js');

// Active database credentials
const supabase = createClient(
  "https://cgpzfuzaxwqlnhtnpslb.supabase.co",
  "sb_publishable_10Xs6U2EgJlemg0rmzZJ_Q_wRNnmhJo"
);

async function test() {
  const { data, error } = await supabase
    .from('group_members')
    .select('groups(id, name)')
    .eq('user_id', 'a12ce5bc-1cdb-40a7-8cf2-065b48ac4ce5');
  console.log("data:", JSON.stringify(data, null, 2));
  console.log("error:", error);
}

test();

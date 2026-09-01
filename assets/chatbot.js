/* MELIORA コンシェルジュ（ルールベース自動応答・保存なし・医療相談ではない） */
(function(){
  'use strict';

  /* ---- 応答ルール ---- */
  var RULES = [
    {k:/aga|薄毛|抜け毛|育毛|生え際|ハゲ|フィナ|ミノキ/i,
     a:'薄毛・AGAですね。治療の選択肢（内服・外用・注入・植毛）と費用・リスクを1ページに整理しています。',
     links:[['AGA・薄毛治療ガイド','treatment-aga.html'],['AGAのクリニックを探す','search.html?cat=aga']]},
    {k:/icl|視力|レーシック|近視|乱視|眼内|コンタクト/i,
     a:'ICL・視力矯正ですね。適応検査の結果が前提になる分野なので、まず「自分が適応かどうか」を確かめる順番がおすすめです。',
     links:[['ICL対応のクリニックを探す','search.html?cat=icl'],['映像で知る（ICL解説）','videos.html']]},
    {k:/二重|鼻|輪郭|リフト|しわ|シミ|たるみ|整形|埋没|切開|肌/i,
     a:'美容整形・肌治療ですね。切らない施術から手術まで段階があり、ダウンタイムと費用で選択肢が変わります。',
     links:[['美容整形のクリニックを探す','search.html?cat=seikei'],['悩みから診断する','shindan.html']]},
    {k:/インプラント|ベニア|ホワイトニング|歯|矯正|審美/i,
     a:'歯の治療ですね。1本単位の総額と保証年数の確認が最重要です。耐用年数・メンテナンス費まで含めて比較しましょう。',
     links:[['審美歯科のクリニックを探す','search.html?cat=implant,veneer']]},
    {k:/脱毛|ムダ毛|痩身|ダイエット|脂肪|ボディ/i,
     a:'医療脱毛・痩身ですね。1回あたりの価格ではなく「完了までの総額」で比較するのがポイントです。',
     links:[['対応クリニックを探す','search.html?cat=datsumo,diet']]},
    {k:/包茎|男性|メンズ|men/i,
     a:'男性医療ですね。プライバシー配慮（完全個室・オンライン診療）と保証内容を基準に、静かに比較できます。',
     links:[['メンズ医療を見る','index.html#formen'],['対応クリニックを探す','search.html?cat=mens']]},
    {k:/費用|料金|価格|お金|総額|いくら|ローン|分割/i,
     a:'費用は自由診療のため全額自己負担です。「月々◯円〜」は最低価格のことが多いので、年間・完了までの総額での比較をおすすめします。',
     links:[['料金の見方（比較の基準）','index.html#compare'],['価格帯からクリニックを探す','search.html']]},
    {k:/リスク|副作用|失敗|危険|安全|後悔/i,
     a:'どの治療にもリスク・副作用があり、効果には個人差があります。当サイトの各治療ガイドでは、メリットと同じ大きさでリスクを記載しています。副作用の説明を省略するクリニックは候補から外すことをおすすめします。',
     links:[['治療ガイドの読み方','index.html#treatments']]},
    {k:/ダウンタイム|腫れ|痛み|回復|仕事|休み/i,
     a:'ダウンタイムは施術によって「ほぼなし」から「1週間以上」まで幅があります。各治療ガイドに目安を記載しています。',
     links:[['AGAガイドで例を見る','treatment-aga.html#downtime']]},
    {k:/予約|カウンセリング|申し込み|受診/i,
     a:'当サイトは比較・情報メディアのため、予約の受付は行っていません。各クリニックの公式サイト・カウンセリング窓口からお申し込みください。',
     links:[['クリニックを探す','search.html']]},
    {k:/広告|pr|アフィリエイト|掲載/i,
     a:'広告掲載を含む場合は「PR」表記で明示し、掲載順・評価は広告の有無と切り離して編集しています。',
     links:[['掲載方針を見る','index.html#compare']]},
    {k:/動画|映像|youtube|ようつべ/i,
     a:'医師・医療機関による解説動画をカテゴリー別にまとめています。',
     links:[['映像で知る','videos.html']]},
    {k:/こんにちは|はじめまして|こんばんは|おはよう|ありがとう/i,
     a:'ご利用ありがとうございます。気になる部位やキーワード（例：AGA、ICL、費用、リスク）を入力いただくか、下のボタンからお進みください。',
     links:[]}
  ];
  var FALLBACK = {
    a:'うまく読み取れませんでした。よろしければ、悩みから探せる診断か、条件で絞れるクリニック検索をご利用ください。キーワード（例：AGA／ICL／費用／リスク／ダウンタイム）でもご案内できます。',
    links:[['悩みから診断する','shindan.html'],['クリニックを探す','search.html']]
  };
  var QUICK = [['悩みから診断','shindan.html',true],['クリニックを探す','search.html',true],
               ['費用について','費用',false],['リスクについて','リスク',false],['動画で知りたい','動画',false]];

  /* ---- DOM構築 ---- */
  var fab = document.createElement('button');
  fab.className='cb-fab'; fab.type='button'; fab.setAttribute('aria-label','コンシェルジュチャットを開く');
  fab.innerHTML='<span class="cb-ico">M</span>';
  var panel = document.createElement('div');
  panel.className='cb-panel'; panel.setAttribute('role','dialog'); panel.setAttribute('aria-label','MELIORAコンシェルジュ');
  panel.innerHTML =
    '<div class="cb-head"><div><b>CONCIERGE</b> <span>自動応答</span></div><button class="cb-close" type="button" aria-label="閉じる">×</button></div>'
    +'<div class="cb-body" id="cb-body"></div>'
    +'<div class="cb-foot"><input id="cb-in" type="text" maxlength="120" placeholder="キーワードを入力（例：AGA、費用）" aria-label="メッセージ入力"><button id="cb-send" type="button">送信</button></div>'
    +'<p class="cb-note">※ 自動応答による情報案内です。医療相談・診断ではありません。治療の判断は必ず医療機関でご相談ください。</p>';
  document.body.appendChild(fab); document.body.appendChild(panel);

  var body = panel.querySelector('#cb-body'), input = panel.querySelector('#cb-in');
  var opened = false;

  function esc(s){return s.replace(/[&<>"]/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]})}
  function scrollEnd(){ body.scrollTop = body.scrollHeight; }
  function botSay(text, links){
    var d=document.createElement('div'); d.className='cb-msg cb-msg--bot';
    var html=esc(text);
    if(links && links.length){ html+='<br>'+links.map(function(l){return '<a href="'+l[1]+'">'+esc(l[0])+' →</a>'}).join('　'); }
    d.innerHTML=html; body.appendChild(d); scrollEnd();
  }
  function userSay(text){
    var d=document.createElement('div'); d.className='cb-msg cb-msg--user'; d.textContent=text;
    body.appendChild(d); scrollEnd();
  }
  function quickRow(){
    var w=document.createElement('div'); w.className='cb-quick';
    QUICK.forEach(function(q){
      var b=document.createElement('button'); b.type='button'; b.textContent=q[0];
      b.addEventListener('click',function(){
        if(q[2]) { location.href=q[1]; return; }
        userSay(q[0]); setTimeout(function(){ answer(q[1]); }, 350);
      });
      w.appendChild(b);
    });
    body.appendChild(w); scrollEnd();
  }
  function answer(text){
    for(var i=0;i<RULES.length;i++){
      if(RULES[i].k.test(text)){ botSay(RULES[i].a, RULES[i].links); return; }
    }
    botSay(FALLBACK.a, FALLBACK.links);
  }
  function send(){
    var t=(input.value||'').trim(); if(!t) return;
    input.value=''; userSay(t);
    setTimeout(function(){ answer(t); }, 400);
  }

  fab.addEventListener('click', function(){
    var open = panel.classList.toggle('is-open');
    if(open && !opened){
      opened=true;
      botSay('こんにちは。MELIORAコンシェルジュです。美容医療の「知る・比べる・選ぶ」をご案内します。気になることを選ぶか、キーワードを入力してください。');
      quickRow();
    }
    if(open) input.focus();
  });
  panel.querySelector('.cb-close').addEventListener('click', function(){ panel.classList.remove('is-open'); });
  panel.querySelector('#cb-send').addEventListener('click', send);
  input.addEventListener('keydown', function(ev){ if(ev.key==='Enter'){ ev.preventDefault(); send(); } });
})();

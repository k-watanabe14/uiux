// オペレーター画面用のサンプルデータ

window.OPERATOR_DATA = (function () {
  const utterances = [
    {
      id: "u1",
      time: "12:03",
      speaker: "顧客",
      role: "customer",
      text: "エアコンが突然動かなくなってしまって、電源を入れても風が出ない状態なんです。"
    },
    {
      id: "u2",
      time: "12:03",
      speaker: "オペレーター",
      role: "operator",
      text: "かしこまりました。ありがとうございます。\n本体のランプに、点滅や色の変化などはありますか？"
    },
    {
      id: "u3",
      time: "12:04",
      speaker: "顧客",
      role: "customer",
      text: "電源ランプが赤く3回点滅したあと、しばらくして消えるような動きをしています。"
    },
    {
      id: "u4",
      time: "12:04",
      speaker: "オペレーター",
      role: "operator",
      text: "承知しました。赤いランプが3回点滅するパターンですね。\nこちらで該当のエラー内容を確認しますので、このまま少々お待ちいただけますか。"
    },
    {
      id: "u5",
      time: "12:05",
      speaker: "顧客",
      role: "customer",
      text: "よろしくお願いします。今はブレーカーも入れ直してみましたが、症状は変わりません。"
    },
    {
      id: "u6",
      time: "12:05",
      speaker: "オペレーター",
      role: "operator",
      text: "ありがとうございます。では、念のため室外機まわりに物が置かれていないかも後ほどご確認いただけますか。"
    }
  ];

  const suggestionVersions = {
    v1: {
      followups: [
        { id: "f1", text: "エラーが発生したタイミング（時間帯・使用時間・設定温度）はいつ頃か？", pinned: false },
        { id: "f2", text: "フィルター清掃や内部クリーニングを最後に実施したのはいつか？", pinned: false },
        { id: "f3", text: "室外機まわりに物が置かれていないか、風通しは確保されているか？", pinned: false },
        { id: "f4", text: "最近ブレーカーが落ちた、停電があったなど電源周りの異常はなかったか？", pinned: false }
      ],
      causes: [
        { id: "c1", text: "温度センサーの故障または配線の断線／接触不良。", pinned: false },
        { id: "c2", text: "フィルターや熱交換器の汚れによる冷却効率の低下。", pinned: false },
        { id: "c3", text: "室外機まわりのスペース不足による排熱不良。", pinned: false },
        { id: "c4", text: "電源電圧の一時的な低下などによる制御基板の誤検知。", pinned: false }
      ],
      script:
        "「赤いランプが3回点滅している場合、内部の温度センサーが異常を検知して安全のために運転を停止している可能性がございます。まず本体の電源を一度お切りいただき、5分ほどお待ちいただいた上で再度電源をお試しいただけますか。あわせて、フィルターの汚れや室外機まわりの風通しもご確認ください。」",
      sources: [
        { id: "ac-err-03", text: "AC-ERR-03：赤点滅3回時のエラーコード定義と判別手順", pinned: false },
        { id: "ac-safe-01", text: "AC-SAFE-01：内部過熱保護が動作した場合の確認・復旧フロー", pinned: false },
        { id: "ac-sensor-05", text: "AC-SENSOR-05：温度センサー異常が疑われる際の現地切り分け手順", pinned: false }
      ]
    },
    v2: {
      followups: [
        {
          id: "f5",
          text: "エラーが出た冷房・暖房どちらの運転中か？設定温度はいくつだったか？",
          pinned: false
        },
        {
          id: "f2",
          text: "フィルター清掃や内部クリーニングを最後に実施したのはいつか？",
          pinned: false
        },
        {
          id: "f3",
          text: "室外機まわりに物が置かれていないか、風通しは確保されているか？",
          pinned: false
        },
        {
          id: "f6",
          text: "ブレーカーの落ちやすさや電圧低下の兆候（照明のちらつきなど）はないか？",
          pinned: false
        }
      ],
      causes: [
        {
          id: "c5",
          text: "温度センサー本体またはコネクタ部の接触不良。",
          pinned: false
        },
        {
          id: "c2",
          text: "フィルターや熱交換器の汚れによる冷却効率の低下。",
          pinned: false
        },
        {
          id: "c3",
          text: "室外機まわりのスペース不足による排熱不良。",
          pinned: false
        },
        {
          id: "c6",
          text: "一時的な電圧降下やノイズに起因する制御基板の保護動作。",
          pinned: false
        }
      ],
      script:
        "「赤いランプが3回点滅している場合、多くは内部の温度センサーが高温を検知し、安全のために運転を停止している状態...試しいただけますか。その際、フィルターの目詰まりや室外機まわりの風通しも合わせてご確認いただくと、再発防止につながります。」",
      sources: [
        { id: "ac-err-03", text: "AC-ERR-03：赤点滅3回時のエラーコード定義と判別手順", pinned: false },
        { id: "ac-safe-01", text: "AC-SAFE-01：内部過熱保護が動作した場合の確認・復旧フロー", pinned: false },
        { id: "ac-sensor-05", text: "AC-SENSOR-05：温度センサー異常が疑われる際の現地切り分け手順", pinned: false },
        { id: "ac-filter-02", text: "AC-FILTER-02：フィルター・熱交換器の汚れ起因トラブル一覧", pinned: false }
      ]
    }
  };

  return {
    utterances,
    suggestionVersions
  };
})();

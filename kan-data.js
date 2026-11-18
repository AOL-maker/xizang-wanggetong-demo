/* 客户看管 · 统一演示数据源（kan-data.js）
   ------------------------------------------------------------------
   为什么要有这个文件：
   1) 「网格长」可以切换网格（如美 / 盐井 / 嘎托），切换后总览 6 卡、异动 6 卡、
      异动列表、对象画像要一起换数据 —— 数据集中在这里，各注入脚本只负责渲染；
   2) 原来 6 卡是写死的 2378 / 1,600 / 89.01%，异动卡写死 800 / 昨日 600，
      与真实条目数（3~11）严重不符，这次统一改成「按网格、按对象」的量级，
      并且让派生指标（渗透率 / 覆盖率）能从分子分母算出、异动卡数字与列表标签合计一致。

   对外接口（window.WGT_KAN）：
     grid() / grids() / setGrid(key) / onChange(fn) / isLeader()
     stats(type)            -> [[label,value,icon],...] 5 张 6 卡数据
     yd(type)               -> { counts:[[cur,yday]x6], items:[{name,chip,addr,meta,tags:[{m,q,u}]}] }
     orgs(type)             -> 对象列表（用于 6 卡下的名单 / 画像）
     orgDetail(type,name)   -> 单个对象的画像数据（含成员信息）
     gridName() / breadcrumb() */
(function () {
  'use strict';

  var STORE_KEY = 'wgtKanGridV1';

  /* ---------- 三个网格 ---------- */
  var GRIDS = [
    { key: 'rumi', name: '如美网格', town: '如美镇', scale: 1 },
    { key: 'yankuang', name: '盐井网格', town: '盐井镇', scale: 0.68 },
    { key: 'mangkang', name: '芒康网格', town: '嘎托镇', scale: 1.33 }
  ];

  var CITY = '昌都市';
  var COUNTY = '芒康县';
  var AREA = '芒康县片区';

  /* ---------- 总览 6 卡 ---------- */
  var STATS = {
    rumi: {
      per: [['个人全量客户', '3,846', 'p'], ['集团AB成员客户', '1,127', 'r'], ['新入网(T-6)客户', '268', 'p'],
        ['中高档客户', '964', 'r'], ['宽带客户', '1,432', 'p'], ['携转挽留中客户', '36', 'r']],
      xq: [['小区(农村)数量', '12', 'p'], ['移动客户规模', '3,846', 'r'], ['宽带客户规模', '1,432', 'p'],
        ['全球通客户规模', '486', 'r'], ['千兆小区数量', '5', 'p'], ['合约客户规模', '918', 'r']],
      yl: [['楼宇(园区)数量', '8', 'p'], ['楼宇(园区)企业数', '34', 'r'], ['建档集团数', '21', 'p'],
        ['企业渗透数', '9', 'r'], ['企业渗透率', '42.86%', 'p'], ['企业成员数', '312', 'r']],
      grp: [['在管集团数', '21', 'p'], ['AB集团数量', '6', 'r'], ['集团成员数', '312', 'p'],
        ['全球通客户数', '87', 'r'], ['合约客户数', '143', 'p'], ['看管覆盖率', '95.24%', 'r']],
      ji: [['在管家庭数', '1,286', 'p'], ['移动宽带家庭数', '742', 'r'], ['外网宽带家庭数', '186', 'p'],
        ['融合家庭数', '508', 'r'], ['融合渗透率', '68.46%', 'p'], ['宽带覆盖率', '72.16%', 'r']]
    },
    yankuang: {
      per: [['个人全量客户', '2,617', 'p'], ['集团AB成员客户', '604', 'r'], ['新入网(T-6)客户', '186', 'p'],
        ['中高档客户', '612', 'r'], ['宽带客户', '974', 'p'], ['携转挽留中客户', '24', 'r']],
      xq: [['小区(农村)数量', '9', 'p'], ['移动客户规模', '2,617', 'r'], ['宽带客户规模', '974', 'p'],
        ['全球通客户规模', '318', 'r'], ['千兆小区数量', '3', 'p'], ['合约客户规模', '626', 'r']],
      yl: [['楼宇(园区)数量', '5', 'p'], ['楼宇(园区)企业数', '22', 'r'], ['建档集团数', '13', 'p'],
        ['企业渗透数', '5', 'r'], ['企业渗透率', '38.46%', 'p'], ['企业成员数', '168', 'r']],
      grp: [['在管集团数', '13', 'p'], ['AB集团数量', '4', 'r'], ['集团成员数', '168', 'p'],
        ['全球通客户数', '52', 'r'], ['合约客户数', '87', 'p'], ['看管覆盖率', '92.31%', 'r']],
      ji: [['在管家庭数', '875', 'p'], ['移动宽带家庭数', '506', 'r'], ['外网宽带家庭数', '121', 'p'],
        ['融合家庭数', '337', 'r'], ['融合渗透率', '66.60%', 'p'], ['宽带覆盖率', '71.66%', 'r']]
    },
    mangkang: {
      per: [['个人全量客户', '5,128', 'p'], ['集团AB成员客户', '1,483', 'r'], ['新入网(T-6)客户', '342', 'p'],
        ['中高档客户', '1,286', 'r'], ['宽带客户', '1,918', 'p'], ['携转挽留中客户', '48', 'r']],
      xq: [['小区(农村)数量', '17', 'p'], ['移动客户规模', '5,128', 'r'], ['宽带客户规模', '1,918', 'p'],
        ['全球通客户规模', '642', 'r'], ['千兆小区数量', '8', 'p'], ['合约客户规模', '1,236', 'r']],
      yl: [['楼宇(园区)数量', '11', 'p'], ['楼宇(园区)企业数', '48', 'r'], ['建档集团数', '29', 'p'],
        ['企业渗透数', '14', 'r'], ['企业渗透率', '48.28%', 'p'], ['企业成员数', '431', 'r']],
      grp: [['在管集团数', '29', 'p'], ['AB集团数量', '9', 'r'], ['集团成员数', '431', 'p'],
        ['全球通客户数', '132', 'r'], ['合约客户数', '208', 'p'], ['看管覆盖率', '96.55%', 'r']],
      ji: [['在管家庭数', '1,712', 'p'], ['移动宽带家庭数', '1,024', 'r'], ['外网宽带家庭数', '246', 'p'],
        ['融合家庭数', '726', 'r'], ['融合渗透率', '70.90%', 'p'], ['宽带覆盖率', '74.18%', 'r']]
    }
  };

  /* ---------- 异动 6 卡：[当月, 昨日] ---------- */
  var YD_COUNTS = {
    rumi: {
      per: [[6, 3], [5, 3], [4, 2], [7, 4], [3, 1], [14, 7]],
      xq: [[8, 4], [6, 3], [4, 2], [9, 5], [3, 1], [17, 8]],
      yl: [[3, 2], [2, 1], [1, 1], [4, 2], [1, 0], [6, 3]],
      grp: [[5, 2], [4, 2], [2, 1], [6, 3], [2, 1], [11, 5]],
      ji: [[7, 3], [6, 3], [4, 2], [5, 2], [3, 1], [13, 6]]
    },
    yankuang: {
      per: [[4, 2], [3, 2], [2, 1], [5, 3], [2, 1], [9, 5]],
      xq: [[5, 3], [4, 2], [3, 1], [6, 3], [2, 1], [11, 6]],
      yl: [[2, 1], [1, 1], [1, 0], [2, 1], [1, 0], [4, 2]],
      grp: [[3, 2], [2, 1], [1, 1], [4, 2], [1, 1], [7, 3]],
      ji: [[5, 2], [4, 2], [3, 2], [4, 2], [2, 1], [9, 4]]
    },
    mangkang: {
      per: [[9, 5], [7, 4], [5, 3], [11, 6], [4, 2], [19, 10]],
      xq: [[12, 6], [9, 5], [6, 3], [13, 7], [4, 2], [24, 12]],
      yl: [[4, 2], [3, 2], [2, 1], [5, 3], [2, 1], [8, 4]],
      grp: [[7, 4], [5, 3], [3, 2], [9, 4], [3, 1], [15, 8]],
      ji: [[10, 5], [8, 4], [6, 3], [7, 3], [4, 2], [18, 9]]
    }
  };

  var METRIC_NAMES = ['当月携出客户数', '当月降档客户数', '当月离网客户数', '当月投诉客户数', '当月解约客户数', '流失预警客户数'];
  var METRIC_TAGS = ['当月携出', '当月降档', '当月离网', '当月投诉', '当月解约', '流失预警'];

  /* ---------- 对象名单（名称 / 标签 / 关联客户数 / 成员数） ---------- */
  /* 名称按芒康县真实地名组织，避免出现「拉萨市…」与面包屑「昌都市-芒康县」矛盾的演示数据 */
  var ORG_DEFS = {
    rumi: {
      xq: [
        ['如美镇安居小区', '318国道12号', 9], ['如美镇澜沧江小区', '澜沧江路8号', 8], ['如美镇竹卡新村', '竹卡路3号', 6]
      ],
      yl: [
        ['如美镇扶贫产业园', '318国道20号', 6], ['如美镇商贸综合楼', '团结路16号', 5], ['如美镇客运站综合楼', '318国道5号', 4],
        ['如美镇竹卡物流园', '竹卡路26号', 5], ['如美镇电商孵化楼', '幸福路9号', 3], ['如美镇农贸市场主体楼', '建设路2号', 4]
      ],
      grp: [
        ['如美镇中心小学', '团结路1号', 14], ['如美镇卫生院', '318国道8号', 11], ['如美镇雪域农牧合作社', '竹卡路12号', 9],
        ['如美镇竹卡加油站', '318国道31号', 7], ['如美镇澜沧江砂石厂', '澜沧江路19号', 8], ['如美镇旅游服务中心', '318国道2号', 10],
        ['如美镇邮政支局', '团结路6号', 6], ['如美镇供电所', '建设路5号', 12], ['如美镇民族手工艺合作社', '幸福路18号', 8],
        ['如美镇客运公司', '318国道5号', 9]
      ],
      ji: [
        ['扎西', '318国道12号3栋2单元501', 3], ['次仁旺姆', '澜沧江路8号1栋1单元302', 2], ['白玛', '竹卡路3号5栋2单元201', 4],
        ['米玛', '团结路16号2栋1单元101', 2], ['格桑', '318国道20号4栋3单元602', 3], ['索朗', '幸福路9号1栋2单元403', 2],
        ['德吉', '建设路2号3栋1单元502', 3], ['普布', '澜沧江路26号2栋2单元301', 2], ['央金', '318国道5号6栋1单元201', 4],
        ['尼玛', '团结路1号2栋3单元102', 2], ['拉姆', '竹卡路12号4栋2单元601', 3]
      ]
    },
    yankuang: {
      xq: [
        ['盐井镇盐田小区', '盐田路6号', 7], ['盐井镇古盐田新村', '古盐田路3号', 6], ['盐井镇纳西民族新村', '纳西路5号', 5]
      ],
      yl: [
        ['盐井镇古盐田文旅园', '古盐田路1号', 5], ['盐井镇葡萄种植产业园', '纳西路18号', 4], ['盐井镇商贸楼', '盐田路9号', 3],
        ['盐井镇加达仓储园', '盐田路28号', 3]
      ],
      grp: [
        ['盐井镇盐业合作社', '盐田路2号', 10], ['盐井镇葡萄酒庄', '纳西路21号', 8], ['盐井镇中心小学', '盐田路7号', 9], ['盐井镇卫生院', '古盐田路5号', 7]
      ],
      ji: [
        ['阿旺', '盐田路6号2栋1单元301', 3], ['卓玛', '古盐田路3号1栋2单元202', 2], ['向巴', '纳西路18号3栋1单元101', 3],
        ['益西', '盐田路9号2栋2单元401', 2], ['斯朗', '古盐田路1号4栋1单元502', 4]
      ]
    },
    mangkang: {
      xq: [
        ['嘎托镇城关小区', '城关路1号', 11], ['嘎托镇团结小区', '团结路8号', 9], ['嘎托镇幸福新村', '幸福路12号', 8], ['嘎托镇滨河小区', '滨河路6号', 7]
      ],
      yl: [
        ['嘎托镇县城综合体', '城关路5号', 8], ['嘎托镇产业孵化园', '滨河路18号', 7], ['嘎托镇农贸市场楼', '建设路3号', 5], ['嘎托镇客运中心楼', '城关路22号', 4]
      ],
      grp: [
        ['芒康县中学', '城关路9号', 16], ['芒康县人民医院', '滨河路2号', 21], ['芒康县供电公司', '建设路11号', 14],
        ['芒康县邮政局', '城关路12号', 9], ['芒康县客运公司', '城关路22号', 11], ['芒康县农业合作社', '幸福路7号', 8]
      ],
      ji: [
        ['顿珠', '城关路1号3栋2单元501', 3], ['多吉', '团结路8号2栋1单元302', 2], ['曲珍', '幸福路12号1栋2单元201', 4],
        ['达瓦', '滨河路6号5栋1单元101', 2], ['平措', '城关路5号4栋2单元602', 3], ['强巴', '建设路3号2栋1单元403', 2], ['玉珍', '滨河路18号3栋1单元202', 3]
      ]
    }
  };

  /* ---------- 工具 ---------- */
  function pad(n, w) { var s = String(n); while (s.length < w) s = '0' + s; return s; }
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i += 1) { h ^= str.charCodeAt(i); h = (h * 16777619) >>> 0; } return h; }
  function pick(arr, seed) { return arr[seed % arr.length]; }

  var PERSON_POOL = ['周强', '吴敏', '李雪', '王磊', '陈霞', '赵静', '刘洋', '孙婷', '杨帆', '何静',
    '罗布', '贡布', '其美', '旦增', '桑珠', '加措', '西热', '边巴', '次旦', '旺堆'];
  var PLAN_POOL = ['129元5G套餐', '159元5G套餐', '199元家庭套餐', '99元4G套餐', '79元动感套餐'];
  var COMPANY_POOL = ['雪域商贸有限公司', '澜沧江物流有限公司', '康巴建材经营部', '高原农牧合作社', '三江电子商务有限公司',
    '芒康县汽修服务中心', '扎西岗餐饮管理公司', '盐井葡萄酒业公司'];
  var INDUSTRY_POOL = ['商贸零售', '仓储物流', '建筑建材', '农牧加工', '电子商务', '汽车服务', '餐饮住宿', '食品加工'];

  function phoneOf(seed) { return '189****' + pad(2100 + (seed % 900), 4); }

  function gridOf(key) {
    for (var i = 0; i < GRIDS.length; i += 1) if (GRIDS[i].key === key) return GRIDS[i];
    return GRIDS[0];
  }

  /* ---------- 状态 ---------- */
  function readGrid() {
    try {
      var v = localStorage.getItem(STORE_KEY);
      for (var i = 0; i < GRIDS.length; i += 1) if (GRIDS[i].key === v) return v;
    } catch (e) {}
    return GRIDS[0].key;
  }
  var current = readGrid();
  var listeners = [];

  function role() {
    try {
      var raw = localStorage.getItem('wanggetong-preferences-v1');
      if (!raw) return '';
      var j = JSON.parse(raw);
      return (j && j.state && j.state.role) || '';
    } catch (e) { return ''; }
  }

  function setGrid(key) {
    if (!key || key === current) return false;
    var ok = false;
    for (var i = 0; i < GRIDS.length; i += 1) if (GRIDS[i].key === key) ok = true;
    if (!ok) return false;
    current = key;
    try { localStorage.setItem(STORE_KEY, key); } catch (e) {}
    for (var k = 0; k < listeners.length; k += 1) { try { listeners[k](key); } catch (e) {} }
    try {
      document.dispatchEvent(new CustomEvent('wgt:grid-change', { detail: { grid: key } }));
    } catch (e) {}
    return true;
  }

  function onChange(fn) { if (typeof fn === 'function') listeners.push(fn); }

  /* ---------- 名单 ---------- */
  function orgList(type) {
    var defs = (ORG_DEFS[current] && ORG_DEFS[current][type]) || [];
    var g = gridOf(current);
    var out = [];
    for (var i = 0; i < defs.length; i += 1) {
      var d = defs[i];
      var name = d[0];
      var addr = CITY + COUNTY + g.town + d[1];
      var n = d[2];
      if (type === 'ji') {
        out.push({
          name: name + '的家庭', chip: '家庭', addr: addr, links: n,
          meta: '家庭联系人：' + name + ' · ' + phoneOf(i * 7 + hash(name)) + ' · 家庭成员 ' + n + ' 位',
          contact: name, phone: phoneOf(i * 7 + hash(name))
        });
      } else if (type === 'grp') {
        out.push({
          name: name, chip: (i % 3 === 1 ? 'B类集团' : 'A类集团'), addr: addr, links: n,
          meta: '集团编码 ' + (6800000 + hash(name) % 190000) + ' · 成员客户 ' + n + ' 位',
          contact: pick(PERSON_POOL, hash(name)), phone: phoneOf(hash(name))
        });
      } else if (type === 'yl') {
        out.push({
          name: name, chip: '园楼', addr: addr, links: n,
          meta: '入驻企业 ' + n + ' 家 · 看管人 张明',
          contact: '张明', phone: phoneOf(hash(name))
        });
      } else {
        out.push({
          name: name, chip: '小区', addr: addr, links: n,
          meta: '关联客户 ' + n + ' 户 · 看管人 张明',
          contact: '张明', phone: phoneOf(hash(name))
        });
      }
    }
    return out;
  }

  /* 异动对象：把 6 个指标的量分配到对象上，保证「卡片数字 = 各对象标签合计」
     分配规则：对象 >= 5 个时每个指标拆给 2 个对象（更自然），否则整笔落给 1 个对象，
     每个对象最多 3 个标签，避免出现「一个小区挂 6 个标签」的失真。 */
  function ydItems(type) {
    var list = orgList(type);
    var counts = (YD_COUNTS[current] && YD_COUNTS[current][type]) || YD_COUNTS.rumi[type];
    var n = list.length;
    if (!n) return [];
    var tags = [];
    for (var i = 0; i < n; i += 1) tags.push([]);
    var split = n >= 5 ? 2 : 1;
    for (var m = 0; m < 6; m += 1) {
      var cnt = counts[m][0];
      if (split === 1) { tags[(m * 2) % n].push({ m: m, q: cnt }); continue; }
      var i1 = (m * 2) % n;
      var i2 = (m * 2 + 1) % n;
      var a = Math.max(1, Math.round(cnt * 0.6));
      var b = Math.max(0, cnt - a);
      tags[i1].push({ m: m, q: a });
      if (b > 0) tags[i2].push({ m: m, q: b });
      else tags[i1][tags[i1].length - 1].q = cnt;
    }
    for (var k = 0; k < n; k += 1) {
      tags[k].sort(function (x, y) { return y.q - x.q; });
      list[k].cats = tags[k].slice(0, 3);
    }
    return list;
  }

  function yd(type) {
    var counts = (YD_COUNTS[current] && YD_COUNTS[current][type]) || YD_COUNTS.rumi[type];
    return { counts: counts, items: ydItems(type), metrics: METRIC_NAMES, tags: METRIC_TAGS };
  }

  /* ---------- 画像数据 ---------- */
  function membersOf(type, org) {
    var seed = hash(org.name);
    var n = org.links || 3;
    var out = [];
    if (type === 'yl') {
      for (var i = 0; i < n; i += 1) {
        var cname = pick(COMPANY_POOL, seed + i * 3);
        out.push({
          name: cname, sub: '联系人 ' + pick(PERSON_POOL, seed + i) + ' · 0895-' + (4000 + (seed + i * 17) % 900),
          role: pick(INDUSTRY_POOL, seed + i * 5), tag: '员工 ' + (12 + (seed + i * 11) % 60) + ' 人'
        });
      }
      return out;
    }
    for (var k = 0; k < n; k += 1) {
      var nm = pick(PERSON_POOL, seed + k * 7);
      var ph = phoneOf(seed + k * 13);
      if (type === 'ji') {
        var roles = ['户主', '配偶', '子女', '父母'];
        out.push({
          name: k === 0 ? org.contact : nm, sub: ph, role: roles[k % 4],
          tag: k === 0 ? '主卡' : '副卡',
          room: ''
        });
      } else if (type === 'grp') {
        out.push({
          name: nm, sub: ph, role: '集团成员',
          tag: pick(PLAN_POOL, seed + k * 3), room: pick(['综合部', '市场部', '财务部', '生产部', '办公室', '运维部', '客服部'], seed + k * 2)
        });
      } else {
        out.push({
          name: nm, sub: ph, role: k === 0 ? '户主' : '家庭成员',
          tag: pick(PLAN_POOL, seed + k * 3),
          room: pick(['1栋1单元', '2栋1单元', '2栋2单元', '3栋1单元', '3栋2单元', '4栋1单元', '5栋2单元'], seed + k * 2) + ' ' + (101 + (k * 67 + seed) % 590)
        });
      }
    }
    return out;
  }

  function orgDetail(type, name) {
    var list = orgList(type);
    var org = null;
    for (var i = 0; i < list.length; i += 1) {
      if (list[i].name === name || list[i].name === name + '的家庭' || (name && list[i].name.indexOf(name) >= 0)) { org = list[i]; break; }
    }
    if (!org) {
      org = { name: name || '演示对象', chip: type === 'ji' ? '家庭' : type === 'grp' ? 'A类集团' : type === 'yl' ? '园楼' : '小区', addr: CITY + COUNTY + gridOf(current).town, links: 3, meta: '', contact: name, phone: phoneOf(hash(name || 'x')) };
    }
    var g = gridOf(current);
    var seed = hash(org.name);
    var s = STATS[current];
    var rows, stats;
    if (type === 'ji') {
      stats = [
        [String(org.links), '位', '家庭成员'],
        [String(1 + seed % 2), '条', '在用宽带'],
        [seed % 3 === 0 ? '已融合' : '未融合', '', '融合状态']
      ];
      rows = [
        ['对象类型：', '家庭（' + org.links + ' 位成员）'],
        ['所属网格：', CITY + '-' + COUNTY + '-' + AREA + '-' + g.name],
        ['家庭地址：', org.addr],
        ['建档时间：', '2024年' + (3 + seed % 8) + '月' + (1 + seed % 27) + '日'],
        ['看管人：', '张明（网格经理）'],
        ['宽带情况：', seed % 3 === 0 ? '已覆盖移动宽带 300M' : '已覆盖移动宽带 200M'],
        ['融合状态：', seed % 2 === 0 ? '已办理融合套餐' : '未办理融合套餐'],
        ['服务等级：', seed % 4 === 0 ? '重点关怀家庭' : '标准服务']
      ];
    } else if (type === 'grp') {
      stats = [
        [String(org.links), '位', '成员客户'],
        [(4 + seed % 9) + '', '户', '在用宽带'],
        [(seed % 2 === 0 ? 'A类' : 'B类'), '', '集团分级']
      ];
      rows = [
        ['集团名称：', org.name],
        ['集团编码：', String(6800000 + seed % 190000)],
        ['所属网格：', CITY + '-' + COUNTY + '-' + AREA + '-' + g.name],
        ['集团地址：', org.addr],
        ['建档时间：', '2023年' + (1 + seed % 12) + '月' + (1 + seed % 27) + '日'],
        ['看管人：', '张明（网格经理）'],
        ['客户经理：', pick(PERSON_POOL, seed)],
        ['集团分级：', seed % 3 === 1 ? 'B类集团（成长型）' : 'A类集团（战略型）']
      ];
    } else if (type === 'yl') {
      stats = [
        [String(org.links), '家', '入驻企业'],
        [(seed % 40 + 18) + '', '位', '企业成员'],
        [(seed % 2 === 0 ? '已建档' : '待建档'), '', '楼宇状态']
      ];
      rows = [
        ['园楼名称：', org.name],
        ['所属网格：', CITY + '-' + COUNTY + '-' + AREA + '-' + g.name],
        ['园楼地址：', org.addr],
        ['楼宇性质：', pick(['产业园区', '商务楼宇', '综合市场'], seed)],
        ['建筑面积：', (2000 + seed % 8000) + ' ㎡'],
        ['看管人：', '张明（网格经理）'],
        ['企业渗透：', org.links + ' 家企业中 ' + (seed % org.links + 1) + ' 家已办理专线'],
        ['建档集团：', (seed % 4 + 2) + ' 个']
      ];
    } else {
      stats = [
        [String(org.links), '户', '关联客户'],
        [(seed % 6 + 2) + '', '户', '在用宽带'],
        [(seed % 2 === 0 ? '千兆' : '百兆'), '', '小区类型']
      ];
      rows = [
        ['小区名称：', org.name],
        ['所属网格：', CITY + '-' + COUNTY + '-' + AREA + '-' + g.name],
        ['小区地址：', org.addr],
        ['小区类型：', pick(['城市住宅小区', '农村聚居小区', '安置小区'], seed)],
        ['覆盖户数：', (org.links * 6 + seed % 30) + ' 户'],
        ['建档时间：', '2023年' + (1 + seed % 12) + '月' + (1 + seed % 27) + '日'],
        ['看管人：', '张明（网格经理）'],
        ['网络覆盖：', seed % 3 === 0 ? '5G + 千兆宽带已覆盖' : '5G + 百兆宽带已覆盖']
      ];
    }
    return {
      type: type,
      typeName: { xq: '小区', yl: '园楼', grp: '集团', ji: '家庭' }[type],
      name: org.name,
      chip: org.chip,
      addr: org.addr,
      grid: CITY + '-' + COUNTY + '-' + AREA + '-' + g.name,
      contact: org.contact || '张明',
      phone: org.phone,
      stats: stats,
      rows: rows,
      meta: org.meta || '',
      members: membersOf(type, org)
    };
  }

  window.WGT_KAN = {
    grids: function () { return GRIDS.slice(); },
    grid: function () { return current; },
    gridName: function () { return gridOf(current).name; },
    gridTown: function () { return gridOf(current).town; },
    breadcrumb: function () { return CITY + '-' + COUNTY + '-' + AREA + '-' + gridOf(current).name; },
    city: CITY, county: COUNTY, area: AREA,
    role: role,
    isLeader: function () { return role() === '网格长'; },
    setGrid: setGrid,
    onChange: onChange,
    stats: function (type) { return (STATS[current] && STATS[current][type]) || STATS.rumi[type]; },
    yd: yd,
    orgs: orgList,
    orgDetail: orgDetail,
    metricNames: METRIC_NAMES
  };
})();

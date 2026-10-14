/** The «Bələdçi» page: what every page, button, colour and mark of the panel means. */
export const guide = {
  title: 'Necə işləyir?',
  subtitle:
    'Paneldəki hər səhifənin, düymənin, rəngin və işarənin mənası. Lazım olan bölməni aşağıdakı siyahıdan seçin.',
  toc: 'Bölmələr',
  workflow: {
    title: 'İş ardıcıllığı',
    intro:
      'Dərslik paneldə bu addımlarla hazırlanır. İlk iki addım AI istifadə etmir və pulsuzdur.',
    add: 'Dərsliyin PDF faylını yükləyirsiniz. Panel onu avtomatik bölmə və mövzulara bölür.',
    source:
      'Mövzunun səhifələri bloklara, sətirlərə və fiqurlara ayrılır. Bu, dərslikdə nəyin harada yazıldığının dəqiq xəritəsidir; sonrakı hər şey ona istinad edir.',
    knowledge:
      'AI mənbədən tərif, qayda, düstur, nümunə və tapşırıqları çıxarır, sonra hər element avtomatik yoxlanılır. Pullu addımdır və hələlik terminaldan işə salınır.',
    review:
      'Redaktor «Review» ekranında hər bloku dərsliklə tutuşdurur və hər elementə qərar verir: təsdiqlə, düzəliş lazımdır və ya rədd et.',
    standards:
      'İstəyə bağlı: mövzular rəsmi standartlara bağlanır ki, kursun standartları nə qədər əhatə etdiyi ölçülsün. Bu, heç bir addımı bloklamır.',
    lesson: 'Hələ hazır deyil: bilik sənədi təsdiqləndikdən sonra yaradılacaq.',
  },
  colors: {
    primary: 'Mavi',
    success: 'Yaşıl',
    accent: 'Narıncı',
    destructive: 'Qırmızı',
    neutral: 'Boz',
  },
  basics: {
    title: 'Menyu, tema və rənglər',
    overview: 'Bütün kitablar üzrə addımlar, növbəti tövsiyə olunan iş və hər kitabın vəziyyəti.',
    books:
      'Bütün dərsliklər. Altında hər kitab ayrıca: qırmızı rəqəm qərar gözləyən yoxlanmalı elementlərdir, «1/22» isə mənbəsi çıxarılmış mövzular.',
    review:
      'Review gözləyən və davam edən mövzular. Qırmızı rəqəm: qərar gözləyən yoxlanmalı elementlər.',
    curricula:
      'Fənn və sinif üzrə kurs (məsələn, «Riyaziyyat — 7-ci sinif»). Boş yaranır, ona dərsliklər əlavə olunur; mövzular, dərslər və ssenarilər onun içində yığılacaq.',
    standards:
      'Komandanın daxil etdiyi rəsmi standart dəstləri (məsələn, ARTİ): yalnız uyğunluğu ölçmək üçün.',
    later: '«Sonra» altındakılar hələ hazır deyil.',
    guide: 'Bu səhifə.',
    trash: 'Silinmiş kitablar: geri qaytarmaq və ya birdəfəlik silmək üçün.',
    theme: 'Menyunun altındakı seçim: cihazın temasına uyğun, açıq və ya tünd.',
    search:
      'Yuxarıdakı axtarış: mövzunu nömrəsinə və ya adına görə bütün kitablarda tapır. ⌘K (Windows-da Ctrl+K) ilə açılır.',
    colorsIntro: 'Rənglər paneldə hər yerdə eyni mənanı verir:',
    primary: 'Əsas məlumat, seçilmiş element, element növü, izah blokları.',
    success: 'Hazırdır, keçdi, dərslikdən təsdiqlənib.',
    accent: 'Diqqət tələb edir, amma xəta deyil: xəbərdarlıq, törəmə element, nümunə blokları.',
    destructive: 'Xəta, keçməyən yoxlama, təsdiqlənməyən element, silmə.',
    neutral: 'Neytral məlumat, hələ edilməyib, tapşırıq blokları.',
    error: 'Əməliyyat alınmadı. «Texniki məlumat» açılanda proqramçılar üçün dəqiq səbəb görünür.',
    command: 'Bu addımı terminaldan işə salmaq üçün əmr. «Kopyala» ilə götürün.',
  },
  books: {
    title: 'Ümumi baxış və dərsliklər',
    steps:
      'Kitabların hamısı üzrə addımlar: neçə mövzunun hansı addımda olduğu. Narıncı çərçivəli addımda iş gözləyir.',
    recommended:
      'Növbəti ən faydalı iş: başlanmış review, sonra pulsuz mənbə çıxarma, sonra bilik çıxarma. Bir düymə ilə başlayır.',
    spine: 'Kitabın sinfi və hissəsi (adından oxunur).',
    cells:
      'Hər kvadrat bir mövzudur, bölmələr arasında boşluq var. Kvadrata toxunanda mövzu açılır.',
    none: 'Mövzunun mənbəyi hələ çıxarılmayıb.',
    source: 'Mənbə var, bilik sənədi hələ yoxdur.',
    knowledge: 'Bilik sənədi var, review gözləyir.',
    review: 'Review başlanıb, hələ bitməyib.',
    approved: 'Bütün blokları təsdiqlənib.',
    dot: 'Mövzuda qərar gözləyən yoxlanmalı element var.',
    extractAll:
      'Kitabın mənbəsi olmayan bütün mövzularını bir-bir çıxarır. Pulsuzdur; bu vaxt paneldə işləməyə davam edə bilərsiniz.',
    bookSteps:
      'Kitab səhifəsində bu kitabın addımları: yaşıl hazırdır, narıncı çərçivəli indiki addımdır.',
    filter: 'Mövzuları addıma görə süzür; qutu yalnız yoxlanmalı elementi olan mövzuları saxlayır.',
    unit: 'Bölmə sətri: toxunanda bölmənin mövzuları cədvəl kimi açılır və ya bağlanır.',
    // «Standartlar» goes back between Review and Dərs planı when STANDARDS_ENABLED is on.
    bar: 'Mövzunun addımları kiçik zolaq kimi: Mənbə → Bilik → Review → Dərs planı.',
    barDone: 'Bu addım hazırdır.',
    barCurrent: 'Bu addım davam edir.',
    barQueued: 'Bu addım sıradadır (əvvəlki hazırdır).',
    action: 'Mövzu ilə indi ediləcək iş: mənbəni çıxar, review-a başla, davam et və ya bax.',
    more: '«Digər əməliyyatlar»: kitabı silmək.',
    restore: 'Silinmiş kitabı bütün faylları ilə geri qaytarır.',
    purge:
      'Kitabı diskdən birdəfəlik silir. Geri qaytarmaq olmur, ona görə əvvəlcə kitabın adını yazmaq lazımdır.',
  },
  review: {
    title: 'Review',
    intro:
      'Mövzu blok-blok yoxlanılır: solda dərslik səhifəsi, sağda seçilmiş blokun dərslikdəki kəsiyi və ondan çıxarılan elementlər. Hər qərar dərhal yadda saxlanılır.',
    pageList:
      'Səhifədəki bloklar: işarəli təsdiqlənib, mavi halqalı indi baxılır, boş halqalı gözləyir. Qırmızı «problem»: qərar gözləyən yoxlanmalı element.',
    flagged: 'Element yoxlanmalıdır: təsdiqlənməyib və ya avtomatik yoxlaması keçməyib.',
    approve: 'Element doğrudur: tələbələrə olduğu kimi göstəriləcək.',
    correct:
      'Element səhvdirsə, amma lazımdırsa: sahələri dərslikdə yazıldığı kimi düzəldin (düstur yazanda görünüşü dərhal göstərilir). Düzəldilmiş versiya təsdiqlənir, AI-nin ilkin variantı saxlanılır.',
    needsFix:
      'İndi düzəldə bilmirsinizsə: nəyin səhv olduğunu qeyd edin, element sonra düzəldilsin.',
    zoom: 'Kəsiyi böyük açır: mətni rahat oxuyun, qərar düymələri yanında işləyir.',
    reject: 'Element lazımsızdır və ya yanlışdır: tələbələrə göstərilməyəcək.',
    undo: 'Qərarı geri alır; blok təsdiqlənibsə, blok yenidən açılır.',
    approveClean: 'Problemsiz (yoxlaması keçmiş) elementlərin hamısını birdən təsdiqləyir.',
    later: 'Bloku hələlik buraxıb növbətinə keçir.',
    approveBlock: 'Blokun bütün elementlərinə qərar veriləndən sonra açılır və bloku təsdiqləyir.',
    done: 'Blok təsdiqlənib. Element sonradan dəyişsə (bilik yenidən yaradılsa), blok özü yenidən açılır.',
  },
  source: {
    title: 'Mövzu: Mənbə',
    intro:
      'Dərslik səhifəsinin şəkli və onun üzərində rəngli çərçivələr: hər çərçivə bir blokdur. Çərçivəyə və ya siyahıdakı bloka toxunanda yanda onun mətni, kəsiyi və fiqurları açılır.',
    stats:
      'Mövzuda neçə səhifə, blok, sətir və fiqur tapıldığı. «Xəbərdarlıq» narıncıdırsa, parser bir şeydən şübhələnib: siyahını yoxlayın.',
    solid: 'Adi blok.',
    dashed: 'İçində başqa bloklar olan qrup (Çalışmalar, Məsələ həlli).',
    selected: 'Seçilmiş blok.',
    kinds:
      'Çərçivənin və nişanın rəngi blokun qrupunu göstərir. Aşağıda hər blok növü öz rəngi ilə:',
    kind: {
      title: 'Mövzunun başlığı.',
      inquiry: 'Mövzunun girişindəki araşdırma və ya müzakirə sualı.',
      section: 'Əsas izah mətni.',
      example: 'Həlli göstərilən məsələ.',
      theorem: 'Teorem və ya xassə.',
      think: 'Düşünməyə çağıran qutu.',
      remember: 'Vacib qayda və ya düstur qutusu.',
      find_mistake: 'Səhv həll verilir, onu tapmaq lazımdır.',
      history: 'Tarixi məlumat qutusu.',
      keywords: 'Mövzunun yeni terminləri.',
      exercises: 'Tapşırıqlar qrupu (içində tək tapşırıqlar var).',
      problems: 'Məsələlər qrupu (içində tək məsələlər var).',
      exercise: 'Tək tapşırıq və ya məsələ.',
      callout: 'Parser bu qutunun növünü tanımadı: qırmızıdır, çünki yoxlanmalıdır.',
    },
    hasMath: 'Blokda düstur var.',
    hasFigure: 'Blokda fiqur var (şəkil, cədvəl, qrafik).',
    lowQuality:
      'Blokun mətn qatı zəifdir: PDF-dəki mətn düzgün oxunmayıb, düsturlar şəkildən oxunmalıdır.',
    mathLine: 'Sətirdə riyazi işarələr var.',
    weakLine: 'Sətir düzgün oxunmayıb: tanınmayan simvollar var.',
    ids: 'Kodlar: b01 blok, l001 sətir, f01 fiqur, k001 bilik elementi. Hər şey bu kodlarla dərsliyə qədər izlənir.',
  },
  knowledge: {
    title: 'Mövzu: Bilik',
    intro:
      'AI-nin mənbədən çıxardığı elementlər. Elementin koduna toxunanda yanda onun dərslikdəki yeri, kəsiyi və sətirləri açılır.',
    textbook: 'Dərslikdə yazıldığı kimi olduğu təsdiqlənib.',
    derived:
      'AI dərslikdəki məlumatı özü strukturlaşdırıb (məsələn, addımlara bölüb); dərslikdə hərfi belə yazılmayıb.',
    unverified: 'Yoxlamalardan keçməyib və ya təsdiqlənə bilməyib: mütləq baxılmalıdır.',
    failed:
      '«Uğursuz yoxlama»: ən azı bir yoxlaması keçməyən elementlərin sayı. Altdakı sətir: sxemə uyğun gəlmədiyi üçün atılan elementlər.',
    imageFormulas:
      '«Şəkildən düstur»: düsturu PDF mətnindən yox, səhifənin şəklindən oxunan elementlər.',
    aiCalls:
      '«AI çağırışı»: AI-yə neçə dəfə müraciət olunub. «cache»: əvvəlki nəticə yenidən istifadə olunub, pulsuzdur.',
    cost: '«Xərc»: bu sənədin AI xərci (dollarla) və token sayı.',
    code: 'Elementin kodu. Toxunanda elementin mənbəyi yanda açılır.',
    type: {
      definition: 'Dərslikdə verilən tərif.',
      rule: 'Sözlə ifadə olunan qayda və ya xassə.',
      formula: 'Adlı və ya çərçivəyə alınmış düstur.',
      worked_example: 'Həlli ilə birlikdə nümunə.',
      exercise: 'Nömrəli tapşırıq.',
      question: 'Açıq sual (Araşdırma, Fikirləş!).',
      figure: 'İzahın istinad etdiyi şəkil, qrafik və ya cədvəl.',
      term: 'Dərsliyin təqdim etdiyi termin.',
      prerequisite: 'Mövzunun əsaslandığı əvvəlki bilik.',
    },
    readImage: 'AI elementi səhifənin şəklindən oxuyub.',
    readText: 'AI elementi PDF-in mətn qatından oxuyub.',
    claimed: 'AI bunu dərslikdə yazıldığı kimi təqdim edib, amma yoxlamalar bunu təsdiqləmədi.',
    sources: 'Elementin götürüldüyü yer: blok kodu, blokun adı, sətir sayı, fiqur, səhifə.',
    figures: 'Mətn şəklə istinad edirsə, həmin şəkil elementin altında göstərilir.',
    panel:
      'Yandakı panel: seçilmiş elementin səhifədəki yeri (çərçivə statusun rəngindədir), kəsiklər və istinad etdiyi sətirlər.',
    statusRule:
      'Status necə təyin olunur: Mənbə ID-ləri, LaTeX sintaksisi və ya Riyazi eynilik keçməsə — Təsdiqlənməyib. AI elementi özü strukturlaşdırıbsa — Törəmə. Şəkil yoxlaması keçibsə (şəkil yoxlaması olmayan mətn elementində isə mətnə uyğunluq keçibsə) — Dərslik. Qalan hallarda — Təsdiqlənməyib.',
  },
  checks: {
    title: 'Yoxlamalar',
    intro:
      'Hər elementin altında «Yoxlamalar» siyahısı var. Keçməyən yoxlama olanda siyahı özü açılır və başlığı qırmızı olur.',
    pass: 'Yoxlama keçdi.',
    fail: 'Yoxlama keçmədi: elementə baxın.',
    skip: 'Bu yoxlama bu elementə aid deyil (məsələn, düsturu olmayan elementdə LaTeX yoxlaması).',
    source_ids: 'AI-nin istinad etdiyi blok, sətir və fiqur kodları mənbədə həqiqətən var.',
    block_kind:
      'Element düzgün blokdan götürülüb: həll nümunəsi eyni nömrəli «Nümunə» blokundan, tapşırıq eyni nömrəli tapşırıqdan, sual Araşdırma və ya Fikirləş! blokundan.',
    text_grounding:
      'Mətndən oxunan elementin sözlərinin ən azı 80%-i istinad etdiyi sətirlərdə var.',
    latex_syntax: 'Düsturlar düzgün yazılıb və ekranda göstərilə bilir.',
    identity: 'Bərabərliklər bir neçə ədəd yerinə qoyulub hesablanıb və doğru çıxıb.',
    image_verification:
      'Ayrıca AI çağırışı elementi səhifənin şəkli ilə tutuşdurub: uyğundursa keçir.',
    figure_link:
      'Mətn şəklə istinad edirsə («şəkildə», «qrafikdə», «cədvəldə»…), uyğun fiqur elementə bağlanıb.',
  },
  standards: {
    title: 'Rəsmi standartlar',
    card: 'Dəstin neçə standartı olduğu və neçə dərsliyin ona bağlı olduğu.',
    paste:
      'Sənəddən mətni yapışdırın: kodla başlayan sətirlər standart, «1. Ədədlər və əməllər» kimi sətirlər məzmun xətti sayılır. Yanda nəyin oxunduğunu görürsünüz.',
    added: 'Bu qədər yeni standart əlavə olunacaq.',
    updated: 'Bu qədər mövcud standartın mətni dəyişəcək (eyni kod təkrar yapışdırılıb).',
    parent: 'Qalın sətir əsas standartdır.',
    child: 'Girintili sətir onun alt standartıdır.',
    edit: 'Standartı dəyiş.',
    remove: 'Standartı sil; ikinci dəfə «Bəli» ilə təsdiqlənir.',
    deleteStandardSet: 'Dəsti yalnız heç bir dərslik ona bağlı deyilsə silmək olar.',
  },
  links: {
    title: 'Standartlara bağlama',
    intro:
      'Kitabın «Standart bağlantıları» səhifəsində əvvəlcə standart dəsti seçilir, sonra mövzular standartlara bağlanır. Bilik elementləri isə mövzunun «Bilik» bölməsində, hər elementin altında bağlanır.',
    topics: 'Ən azı bir standartı olan mövzuların sayı / bütün mövzular.',
    covered: 'Kitabın əhatə etdiyi standartlar / dəstdəki bütün standartlar.',
    uncovered: 'Kitabda heç bir mövzuya bağlanmayan standartlar: boşluq ola bilər.',
    items: 'Bilik elementlərinə edilən bağlantıların sayı.',
    link: 'Seçim pəncərəsini açır: axtarın, uyğun standartları işarələyin, yadda saxlayın.',
    code: 'Bağlı standart və onun mətni.',
    removed:
      'Qırmızı kod: standart dəstdən silinib, amma bağlantı qalıb. Seçim pəncərəsində işarəsini götürüb silin.',
    notLinked: '«Standartlar üzrə» görünüşdə: bu standart heç bir mövzuya bağlanmayıb.',
    topicChip: 'Bu standartı öyrədən mövzu; toxunanda mövzu açılır.',
    orphan:
      'Bilik sənədi yenidən yaradılanda element dəyişib və ya yox olub. Bağlantı itmir: uyğun elementi yenidən bağlayın, köhnəsini silin.',
  },
} as const;

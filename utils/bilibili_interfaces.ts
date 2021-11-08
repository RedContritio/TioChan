export interface BilibiliArticleMetaResponse {
    code: number;
    message: string;
    ttl: number;
    data: ArticleMetaResponseData;
}
export interface ArticleMetaResponseData {
    articles?: (ArticleMeta)[] | null;
    pn: number;
    ps: number;
    count: number;
}
export interface ArticleMeta {
    id: number;
    category: Category;
    categories?: (Category)[] | null;
    title: string;
    summary: string;
    banner_url: string;
    template_id: number;
    state: number;
    author: Author;
    reprint: number;
    image_urls?: (string)[] | null;
    publish_time: number;
    ctime: number;
    stats: Stats;
    words: number;
    origin_image_urls?: (string)[] | null;
    list?: null;
    is_like: boolean;
    media: Media;
    apply_time: string;
    check_time: string;
    original: number;
    act_id: number;
    dispute?: Dispute | null;
    authenMark?: null;
    cover_avid: number;
    top_video_info?: null;
    type: number;
    tags?: (TagsEntity)[] | null;
}
export interface Category {
    id: number;
    parent_id: number;
    name: string;
}
export interface Author {
    mid: number;
    name: string;
    face: string;
    pendant: Pendant;
    official_verify: OfficialVerify;
    nameplate: Nameplate;
    vip: Vip;
}
export interface Pendant {
    pid: number;
    name: string;
    image: string;
    expire: number;
}
export interface OfficialVerify {
    type: number;
    desc: string;
}
export interface Nameplate {
    nid: number;
    name: string;
    image: string;
    image_small: string;
    level: string;
    condition: string;
}
export interface Vip {
    type: number;
    status: number;
    due_date: number;
    vip_pay_type: number;
    theme_type: number;
    label: Label;
    avatar_subscript: number;
    nickname_color: string;
}
export interface Label {
    path: string;
    text: string;
    label_theme: string;
}
export interface Stats {
    view: number;
    favorite: number;
    like: number;
    dislike: number;
    reply: number;
    share: number;
    coin: number;
    dynamic: number;
}
export interface Media {
    score: number;
    media_id: number;
    title: string;
    cover: string;
    area: string;
    type_id: number;
    type_name: string;
    spoiler: number;
}
export interface Dispute {
    dispute: string;
    dispute_url: string;
}
export interface TagsEntity {
    tid: number;
    name: string;
}

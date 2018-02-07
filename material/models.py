from django.db import models
from label.models import Label
from account.models import User


class Discourse(models.Model):
    discourse_code = models.CharField(max_length=50, verbose_name="语篇编号", default="")
    discourse = models.TextField(verbose_name="语篇内容", default="") 
    DOMAIN_CHOICES = (
        ("jy", "教育"),
        ("zc", "职场"),
        ("gg", "公共"),
        ("gr", "个人"),
    )
    domain = models.CharField(max_length=50, verbose_name="领域", choices=DOMAIN_CHOICES, null=True)
    GENRE_CHOICES = (
        ("ylw", "议论文"),
        ("smw", "说明文"),
        ("jxw", "记叙文"),
        ("msw", "描述文"),
    )
    genre = models.CharField(max_length=50, verbose_name="文本体裁", choices=GENRE_CHOICES, null=True)
    TEXT_TYPE_CHOICES = (
        ("db", "独白"),
        ("dh", "对话"),
        ("tl", "讨论"),
    )
    text_type = models.CharField(max_length=50, verbose_name="文本类型", choices=TEXT_TYPE_CHOICES, null=True)
    AUTHENTICITY_CHOICES = (
        ("zsyp", "真实语篇"),
        ("gbyp", "改编语篇"),
    )
    authenticity = models.CharField(max_length=50, verbose_name="素材真实性", choices=AUTHENTICITY_CHOICES, null=True)
    word_num = models.IntegerField(default=0, verbose_name="文本字数")
    avg_syllable_num = models.FloatField(default=0, verbose_name="平均音节数")
    lemma_num = models.IntegerField(default=0, verbose_name="词元数")
    family_num = models.IntegerField(default=0, verbose_name="词族数")
    common_rate = models.FloatField(default=0, verbose_name="通用词汇占比")
    academic_rate = models.FloatField(default=0, verbose_name="学术词汇占比")
    major_rate = models.FloatField(default=0, verbose_name="专业词汇占比")
    audio_type = models.CharField(default="", max_length=10, verbose_name="音频类型")
    audio_all_time = models.FloatField(default=0, verbose_name="音频完整时长")
    audio_real_time = models.FloatField(default=0, verbose_name="音频真实说话时长")
    speed = models.IntegerField(default=0, verbose_name="语速")
    SPEED_TYPE_CHOICES = (
        ("ks", "快速"),
        ("jk", "较快"),
        ("zs", "中速"),
        ("jm", "较慢"),
        ("ms", "慢速"),
    )
    speed_type = models.CharField(max_length=20, verbose_name="语速分档", choices=SPEED_TYPE_CHOICES, null=True)
    VOICE_TYPE_CHOICES = (
        ("my", "美音"),
        ("yy", "英音"),
        ("adly", "澳大利亚"),
        ("jnd", "加拿大"),
    )
    # 写入内容：美音，英音，澳大利亚，加拿大
    voice_type = models.CharField(max_length=50, verbose_name="口音", choices=VOICE_TYPE_CHOICES, null=True)
    indep_clause_num = models.IntegerField(default=0, verbose_name="从属子句数")
    t_num = models.IntegerField(default=0, verbose_name="T单位数量")
    clause_num = models.IntegerField(default=0, verbose_name="小句数量")
    familiarity = models.CharField(default="", max_length=20, verbose_name="话题熟悉度")
    IS_CHART_TYPES = (
        ("0", "否"),
        ("1", "是"),
    )
    is_chart = models.CharField(max_length=10, verbose_name="是否包含图表辅助信息", choices=IS_CHART_TYPES, default="0")
    sentence_num = models.IntegerField(default=0, verbose_name="句子数量")
    avg_words_per_sent = models.FloatField(default=0, verbose_name="平均词数")
    flesch_kincaid_grade_level  = models.FloatField(default=0, verbose_name="文本可读性指标")
    discourse_tag_user = models.CharField(max_length=50, verbose_name="语篇标注人", null=True,)
    TAG_STATUS_CHOICES = (
        ("wbz", "未标注"),
        ("dxg", "待修改"),
        ("ybz", "已标注"),
    )
    tag_status = models.CharField(max_length=20, verbose_name="语篇标注状态", choices=TAG_STATUS_CHOICES, null=True)
    discourse_review_user = models.CharField(max_length=50, verbose_name="语篇评审人", null=True,)
    REVIEW_STATUS_CHOICES = (
        ("wps", "未评审"),
        ("wtg", "评审未通过"),
        ("tg", "评审通过"),
    )
    review_status = models.CharField(max_length=20, verbose_name="语篇评审状态", choices=REVIEW_STATUS_CHOICES, null=True)
    review_fail_reason = models.CharField(max_length=500, verbose_name="语篇评审未通过原因", null=True)

    class Meta:
        db_table = 'discourse_quata'


class Title(models.Model):
    PLATFORM_CHOICES = (
        ("itest", "itest"),
        ("ucampus", "u校园"),
        ("u2", "u2"),
    )

    platform = models.CharField(max_length=20, verbose_name="平台名称", choices=PLATFORM_CHOICES, null=True)  # 写入内容：itest, u校园，u2
    # "命名规则： itest题目以 itest_ 作为前缀 + 数字编号 u3题目以 u3_ 作为前缀 +  数字编号"
    title_ident = models.CharField(max_length=50, verbose_name="题目编号", null=True) 

    # 命名规则： itest题目此字段不用写入； u3教材题目以u3_作前缀+单元ID+""_""+微课序号+""_""+tab页序号+""_""+\
    #            taskpage序号+""_""+题目所在task页序号（对于unit_test的题目来说，tab页和taskpage序号都为1）
    title_detail_path = models.CharField(max_length=200, verbose_name="题目详细路径", null=True)

    TITLE_TYPE_CHOICES = (
        ("tk", "题库"),
        ("jcptxt", "教材配套习题"),
    )
    title_type = models.CharField(max_length=20, verbose_name="题目类型", choices=TITLE_TYPE_CHOICES, null=True)
    title_course = models.CharField(max_length=100, verbose_name="题目对应教材", null=True)
    TITLE_CATEGORY_CHOICES = (
        ("tl", "听力"),
        ("yd", "阅读"),
        ("xz", "写作"),
        ("ky", "口语"),
    )
    title_category = models.CharField(max_length=20, verbose_name="题目对应分类", choices=TITLE_CATEGORY_CHOICES, null=True)
    title_info = models.TextField(verbose_name="题目内容", null=True)
    title_url = models.CharField(max_length=500, verbose_name="题目详情页地址", null=True)
    video_path = models.CharField(max_length=100, verbose_name="音频存放地址", null=True)
    version = models.CharField(max_length=100, verbose_name="题目版本", null=True)
    # 语篇编号默认与题目编号一致，当后续出现同样语篇的题目时，该题目的语篇编号为最早同样语篇对应的编号
    discourse_code = models.CharField(max_length=50, verbose_name="语篇编号", null=True)

    # 此字段用于关联学生做题成绩使用，标注工具不使用
    block_id = models.CharField(max_length=100, verbose_name="题目所处区域ID", null=True)
    label_tag_user = models.CharField(max_length=50, verbose_name="微技能标注人", null=True,)

    LABEL_TAG_STATUS_CHOICES = (
        ("wbz", "未标注"),
        ("dxg", "待修改"),
        ("ybz", "已标注"),
    )
    label_tag_status = models.CharField(max_length=20, verbose_name="微技能标注状态", choices=LABEL_TAG_STATUS_CHOICES, null=True)
    label_review_user = models.CharField(max_length=50, verbose_name="微技能评审人", null=True,)

    LABEL_REVIEW_STATUS_CHOICES = (
        ("wps", "未评审"),
        ("pswtg", "评审未通过"),
        ("pstg", "评审通过"),
    )
    label_review_status = models.CharField(max_length=20, verbose_name="微技能评审状态", choices=LABEL_REVIEW_STATUS_CHOICES, null=True)
    review_fail_reason = models.CharField(max_length=500, verbose_name="微技能评审未通过原因", null=True)
    tutorial_id = models.CharField(max_length=255, verbose_name="教程id", null=True)
    tutorial_name = models.CharField(max_length=100, verbose_name="教程名称", null=True)
    unit_id = models.CharField(max_length=255, verbose_name="单元id", null=True)
    unit_name = models.CharField(max_length=100, verbose_name="单元名称", null=True)
    minicoz_id = models.CharField(max_length=255, verbose_name="微课id", null=True)
    minicoz_name = models.CharField(max_length=100, verbose_name="微课名称", null=True)
    task_id = models.CharField(max_length=255, verbose_name="taskid", null=True)

    @property
    def discourse(self):
        return Discourse.objects.get(discourse_code=self.discourse_code)

    @property
    def questions(self):
        return Question.objects.filter(title_ident=self.title_ident)

    class Meta:
        db_table = 'title_bank'


class Question(models.Model):
    title_ident = models.CharField(max_length=50, verbose_name="题目编号", null=True)

    @property
    def title(self):
        return Title.objects.get(title_ident=self.title_ident)

    question_index = models.CharField(max_length=10, verbose_name="问题序号", null=True)
    content_level_1 = models.ForeignKey(
        Label, related_name='questions_c1', on_delete=models.deletion.DO_NOTHING,
        verbose_name="内容一级标签", null=True,)
    content_level_2 = models.ForeignKey(
        Label, related_name='questions_c2', on_delete=models.deletion.DO_NOTHING,
        verbose_name="内容二级标签", null=True,)
    skill_level_1 = models.ForeignKey(
        Label, related_name='questions_s1', on_delete=models.deletion.DO_NOTHING,
        verbose_name="微技能一级标签", null=True,)
    skill_level_2 = models.ForeignKey(
        Label, related_name='questions_s2', on_delete=models.deletion.DO_NOTHING,
        verbose_name="微技能二级标签", null=True,)

    class Meta:
        db_table = 'question_detail'

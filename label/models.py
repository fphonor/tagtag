from django.db import models


class Label(models.Model):
    SKILL_TYPE_CHOICES = (
        ('TL', '听力'),
        ('YD', '阅读'),
        ('XZ', '写作'),
        ('KY', '口语'),
    )
    skill_type = models.CharField(max_length=20, verbose_name='技能分类', choices=SKILL_TYPE_CHOICES, default="TL")

    LABEL_TYPE_CHOICES = (
        ('WJN', '微技能'),
        ('NRKJ', '内容框架'),
    )
    label_type = models.CharField(max_length=10, verbose_name='标签分类', choices=LABEL_TYPE_CHOICES)

    level = models.IntegerField(db_column='label_level', verbose_name='标签级别', default=1)

    name = models.CharField(db_column='label_name', max_length=50, verbose_name='名称', default="")

    parent = models.ForeignKey(
        'label.Label',
        related_name='children',
        on_delete=models.deletion.CASCADE,
        verbose_name='父标签ID',
        null=True,
    ) # 根节点父ID默认为0
    date_joined= models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'label_dict'


class Course(models.Model):
    id = models.CharField(db_column='course_id', max_length=100, verbose_name='课程ID', primary_key=True, default="")
    name = models.CharField(db_column='course_name', max_length=100, verbose_name='课程名称', default="")
    name_zh = models.CharField(db_column='course_ch_name', max_length=100, verbose_name='课程中文名称', default="")
    unit_num = models.IntegerField(verbose_name='单元数量', default=10)

    class Meta:
        db_table = 'course_info'

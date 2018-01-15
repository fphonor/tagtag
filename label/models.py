from django.db import models


class Label(models.Model):
    SKILL_TYPE_CHOICES = (
        ("tl", "听力"),
        ("yd", "阅读"),
        ("xz", "写作"),
        ("ky", "口语"),
    )
    skill_type = models.CharField(max_length=20, verbose_name="技能分类", choices=SKILL_TYPE_CHOICES)

    LABEL_TYPE_CHOICES = (
        ("0", "微技能"),
        ("1", "内容框架"),
    )
    label_type = models.CharField(max_length=10, verbose_name="标签分类", choices=LABEL_TYPE_CHOICES)

    label_level = models.IntegerField(verbose_name="标签级别")

    label_name = models.CharField(max_length=50, verbose_name="名称")

    parent = models.ForeignKey(
        'label.Label',
        related_name='children',
        on_delete=models.deletion.CASCADE,
        verbose_name="父标签ID",
        null=True,
    ) # 根节点父ID默认为0
    date_joined= models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)

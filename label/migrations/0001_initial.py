# Generated by Django 2.0 on 2018-02-23 05:14

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Course',
            fields=[
                ('id', models.CharField(db_column='course_id', default='', max_length=100, primary_key=True, serialize=False, verbose_name='课程ID')),
                ('name', models.CharField(db_column='course_name', default='', max_length=100, verbose_name='课程名称')),
                ('name_zh', models.CharField(db_column='course_ch_name', default='', max_length=100, verbose_name='课程中文名称')),
                ('unit_num', models.IntegerField(default=10, verbose_name='单元数量')),
            ],
            options={
                'db_table': 'course_info',
            },
        ),
        migrations.CreateModel(
            name='Label',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('skill_type', models.CharField(choices=[('TL', '听力'), ('YD', '阅读'), ('XZ', '写作'), ('KY', '口语')], default='TL', max_length=20, verbose_name='技能分类')),
                ('label_type', models.CharField(choices=[('WJN', '微技能'), ('NRKJ', '内容框架')], max_length=10, verbose_name='标签分类')),
                ('level', models.IntegerField(db_column='label_level', default=1, verbose_name='标签级别')),
                ('name', models.CharField(db_column='label_name', default='', max_length=50, verbose_name='名称')),
                ('parent', models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, related_name='children', to='label.Label', verbose_name='父标签ID')),
            ],
            options={
                'db_table': 'label_dict',
            },
        ),
    ]

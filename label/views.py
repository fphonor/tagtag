from label.models import Label


def add_label(req):
    req.POST.get('label')


def delete_label(req, id):
    Label.objects.delete(pk=id)
    return {"status": "OK"}


def modify_label(req, id):
    Label.objects.update(pk=id)
    return {"status": "OK"}


def get_labels(req, parent_id=None):
    labels = Label.objects.filter(parent_id=int(parent_id))
    return {"data": {"labels": labels}}
